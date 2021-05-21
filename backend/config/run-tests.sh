#!/bin/bash
WORKDIR=`dirname $0`;
source $WORKDIR/.env.test
export DOTENV_CONFIG_PATH=./.env.test
bash $WORKDIR/wait-for-it.sh $DBHOST:$DBPORT -t 10 -s