#!/bin/bash
export DBHOST=database.servicetws.com;
export DBPORT=27017;
export DOTENV_CONFIG_PATH=./.env.development
bash ./wait-for-it.sh $DBHOST:$DBPORT -t 10 -s -- \
    node -r dotenv/config server.js