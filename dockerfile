# DOCKERFILE
# You might have to change this from dockerhub. Node "latest" it's not suitable for production.
# Use: https://hub.docker.com/_/node and check for the recommended in: https://nodejs.org/en/
# You should find an image according to your server and architecture. 
# Also, big images come with more vulnerabilities. Try to use something like alpine. 
FROM node:14.12-alpine

# Here you should do stuff like "apk install", etc. that needs root privileges.

# Install node packages.
# Apply the permissions on the begining.
RUN mkdir -p /home/node/app/node_modules \
    && chown -R node:node /home/node/app \
    && chmod -R +x /home/node/app

WORKDIR /home/node/app
COPY --chown=node:node ./package*.json ./

# Do NOT run as root user!
USER node
RUN npm install
COPY --chown=node:node . .

# According to your needs, you might want to compile or not. 
# RUN npm run compile

# Prepare volume
#VOLUME /home/node/app/persisted

# It's very important to run it with node and not pm2 or another process manager.
# This way, you give the restart decision to docker-compose.
CMD ["npm", "run", "start:dev"]