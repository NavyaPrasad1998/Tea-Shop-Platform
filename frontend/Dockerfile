# Stage 1: Build the React app
FROM node:16 AS build

WORKDIR /app
COPY . . 
RUN npm install
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Expose the port Nginx is serving the React app on
EXPOSE 80

