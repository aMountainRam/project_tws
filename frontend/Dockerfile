FROM node:latest as build

WORKDIR /app
COPY . .
RUN cat ./.env
RUN yarn
RUN yarn build

# server
FROM nginx:latest
COPY --from=build /app/build/ /usr/share/nginx/html/
COPY ./includes/mime.types /etc/nginx/includes/mime.types
COPY ./includes/proxy.conf /etc/nginx/includes/proxy.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./ssl/frontend.servicetws.com.crt /etc/ssl/certs/nginx/
COPY ./ssl/frontend.servicetws.com.key /etc/ssl/certs/nginx/
COPY ./ssl/ssl_passphrase.txt /var/lib/nginx/
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]