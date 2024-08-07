#!/bin/bash
FULL_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$FULL_DIR" || exit
echo `pwd`
DIR_NAME=$(basename "$FULL_DIR")
echo "current folder: $DIR_NAME"
APP_NAME=${DIR_NAME}
echo "app name: $APP_NAME"

git pull
#rm -rf .next
pnpm install
pnpm run build
echo "pm2 restart $APP_NAME"
pm2 restart $APP_NAME
