FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npx browserslist@latest --update-db
RUN npm i postcss-safe-parser
COPY . .
EXPOSE 3000
CMD ["npm", "start"]