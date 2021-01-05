FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn run build
CMD ["yarn", "start"]
