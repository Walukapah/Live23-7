const { spawn } = require("child_process");

const streamKey = "KEYYYYYYY"; // Replace with your key
const videoSource = "video.mp4"; // Your video file
const audioSource = "https://stream.zeno.fm/ez4m4918n98uv"; // Optional audio file

function startStream() {
    console.log("Starting YouTube Live Stream...");

    const ffmpegArgs = [
        "-re", // Read input at native frame rate
        "-stream_loop", "-1", // Loop video infinitely
        "-i", videoSource,
        "-i", audioSource,
        "-c:v", "libx264", // Video codec
        "-preset", "ultrafast",
        "-b:v", "4500k", // Bitrate
        "-c:a", "aac", // Audio codec
        "-b:a", "160k",
        "-f", "flv", // Output format
        `rtmp://a.rtmp.youtube.com/live2/${streamKey}` // YouTube RTMP URL
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs, { stdio: ["ignore", "ignore", "pipe"] }); // Hide normal logs, only capture errors

    let lastLogTime = Date.now();

    ffmpeg.stderr.on("data", (data) => {
        const output = data.toString();
        
        // Extract time and bitrate from FFmpeg logs
        const timeMatch = output.match(/time=(\d+:\d+:\d+\.\d+)/);
        const bitrateMatch = output.match(/bitrate= *([\d.]+kbits\/s)/);
        
        if (timeMatch && bitrateMatch) {
            const currentTime = Date.now();
            if (currentTime - lastLogTime >= 10000) { // Log every 10 seconds
                console.log(`Streaming Time: ${timeMatch[1]} | Bitrate: ${bitrateMatch[1]}`);
                lastLogTime = currentTime;
            }
        }
    });

    ffmpeg.on("close", (code) => {
        console.error(`FFmpeg crashed with code ${code}. Restarting...`);
        setTimeout(startStream, 2000); // Restart FFmpeg after 2 seconds
    });

    ffmpeg.on("error", (err) => {
        console.error(`FFmpeg Error: ${err.message}`);
        setTimeout(startStream, 2000); // Restart if FFmpeg fails
    });
}

// Start the stream
startStream();
