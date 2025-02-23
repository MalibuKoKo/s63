#!/bin/sh

HOST="dietpi"
#HOST="pi@172.24.1.1"

rsync -av --delete --exclude=.devbox --exclude=devbox.lock --exclude=.git --exclude=node_modules /home/nicolas.collet/workspace/github.com/MalibuKoKo/s63/ $HOST:/home/dietpi/s63
# ssh $HOST -t 'sudo pm2 restart all'