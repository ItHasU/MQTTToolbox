###############################################################################
# This file contains only the image to run the app. You will need to build    #
# the app before building the image. As an exemple, I use the following       #
# commands, to build arm image :                                              #
# $ rm -rf dist                                                               #
# $ npm run build:prod                                                        #
# $ docker buildx build --push --platform linux/arm/v7,linux/amd64 \          #
#                       --tag ithasu/mqtt-toolbox:dev .                       #
###############################################################################
FROM node:14-alpine AS run
RUN apk add --no-cache tzdata

WORKDIR /app

# Config should very rarely change
EXPOSE 3333
ENV CONFIG=/app/config.json
ENV PORT=3333

# Specific files for docker image
COPY docker/ /app/

# First layer for npm install, will allow to lighten updates if they did not changed
COPY package.json package-lock.json /app/
RUN cd /app/ && npm install --production

# Second layer, will only be modified is resulting app is modified
COPY dist/apps/ /app

ENTRYPOINT [ "node", "/app/server/main.js" ]
