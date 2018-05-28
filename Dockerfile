FROM mhart/alpine-node:8
RUN apk update && apk upgrade && apk add curl bash git
RUN npm install -g npm

COPY src/ /opt/resource/
COPY package.json /opt/resource/package.json
RUN mv /opt/resource/check.js /opt/resource/check
RUN mv /opt/resource/in.js /opt/resource/in
RUN mv /opt/resource/out.js /opt/resource/out

RUN chmod +x /opt/resource/check /opt/resource/in /opt/resource/in

WORKDIR /opt/resource

RUN npm install --production
