#!/bin/bash
export DBHOST=database.servicetws.com;
export DBPORT=27017;
export DOTENV_CONFIG_PATH=./.env.development
WORKDIR=`dirname $0`;
bash $WORKDIR/wait-for-it.sh $DBHOST:$DBPORT -t 10 -s -- \
    node -r dotenv/config $(pwd)/server.js