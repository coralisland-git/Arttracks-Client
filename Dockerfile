FROM wemyss/node-canvas
MAINTAINER Leo Larkpor of ArtTracks

#ENV WP_PORT 8079

WORKDIR /app

COPY . /app

WORKDIR /app/app
RUN npm install

EXPOSE 8080
EXPOSE 8079

ENTRYPOINT ["npm"]

#CMD ["run", "start"]
CMD ["run", "dev", "-s"]


