FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production --no-optional
RUN npm cache clean --force
COPY . .
EXPOSE 80
CMD ["node", "index.js"]
