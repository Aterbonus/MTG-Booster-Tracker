#!/bin/sh
# -e Exit immediately when a command returns a non-zero status.
# -x Print commands before they are executed
set -ex

BASEDIR=$(dirname "$0")
rm -f $BASEDIR/cards.db*
pnpm prisma migrate reset --force --skip-seed
ts-node $BASEDIR/seed.ts
mv $BASEDIR/cards.db $BASEDIR/../public/