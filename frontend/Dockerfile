FROM node:latest as build

WORKDIR /app
COPY . .
RUN cat ./.env
RUN yarn
RUN yarn build

# server
FROM nginx:latest
COPY --from=build /app/build/ /usr/share/nginx/html/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]