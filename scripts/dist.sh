#!/bin/sh
set -euo pipefail

DIST_DIR=${1:-}

if [ -z "$DIST_DIR" ]; then
  echo "Usage: `basename $0` <outputdir>"
  exit 1
fi

mkdir -p $DIST_DIR/src/main
cd `dirname $0`/..
cp -r web/dist $DIST_DIR/web/
cp -r src/main/{resources,webapp} $DIST_DIR/src/main/
cd $DIST_DIR
zip -qr ../$(basename $DIST_DIR).zip *