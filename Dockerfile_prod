FROM wemyss/node-canvas
MAINTAINER Leo Larkpor of ArtTracks

#ENV WP_PORT 8079

WORKDIR /app

COPY ./app /app

# WORKDIR /app/app
RUN npm install
RUN npm install --global bower
RUN bower install --allow-root

#EXPOSE 8080
#EXPOSE 8079

ENTRYPOINT ["npm"]

#CMD ["run", "start"]
CMD ["run", "prod", "-s"]