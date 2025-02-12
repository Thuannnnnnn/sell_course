
FROM node:20


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


RUN npm install -g ts-node-dev


COPY . .


EXPOSE 8080


CMD ["npm", "run", "start"]

