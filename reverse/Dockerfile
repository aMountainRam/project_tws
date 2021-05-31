FROM nginx:latest

COPY ./includes/mime.types /etc/nginx/includes/mime.types
COPY ./includes/proxy.conf /etc/nginx/includes/proxy.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./ssl/reverse.servicetws.com.crt /etc/ssl/certs/nginx/
COPY ./ssl/reverse.servicetws.com.key /etc/ssl/certs/nginx/
COPY ./ssl/ca-certificate.crt /etc/ssl/certs/nginx/
COPY ./ssl/ssl_passphrase.txt /var/lib/nginx/

