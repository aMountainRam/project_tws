FROM node:14

WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm i

ARG node_env
ENV NODE_ENV=${node_env}
ENV DOTENV_CONFIG_PATH=./.env.${node_env}

COPY . .
COPY ./config/run.${node_env}.sh .
RUN chmod +x ./*.sh
EXPOSE 8443
ENTRYPOINT ["bash"]
CMD ["./run.${node_env}.sh"]