FROM node:14

WORKDIR /usr/src/app
COPY ./package*.json ./
RUN ["yarn", "install", "--prod"]

ARG node_env
ENV NODE_ENV=${node_env}
ENV DOTENV_CONFIG_PATH=./.env.$NODE_ENV

COPY ./src .
COPY ./ssl ./ssl
COPY ./config ./
RUN chmod +x ./*.sh
EXPOSE 8443
ENTRYPOINT ["bash"]
CMD ["./run.sh"]