#!/usr/bin/env bash
# Upload the site to the Hetzner server. Run from the project folder in Git Bash:
#   bash deploy.sh
set -euo pipefail
KEY="${KEY:-$HOME/.ssh/hetzner_46}"
HOST="deploy@46.62.231.109"
DEST="/var/www/peoplefirst.ink"
cd "$(dirname "$0")"
tar --exclude=.git --exclude=.claude --exclude=deploy.sh --exclude=.gitignore -cf - \
  404.html about.html approach.html contact.html index.html services.html robots.txt sitemap.xml css js \
  | ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST" "mkdir -p $DEST && tar -xf - -C $DEST && chmod -R a+rX $DEST && echo 'Deployed to $DEST'"
