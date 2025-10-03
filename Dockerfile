FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY views ./views
ENV PORT=3000
EXPOSE 3000
CMD ["npm","start"]
