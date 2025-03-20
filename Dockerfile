FROM quay.io/lyfe00011/md:beta
RUN git clone https://github.com/Walukapah/Live23-7 /root/LyFE/
WORKDIR /root/LyFE/
RUN yarn install
CMD ["npm", "start"]
