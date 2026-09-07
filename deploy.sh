#!/usr/bin/env bash
# Deploy peoplefirst.ink to the Hetzner server. Run from the project folder in Git Bash:
#   bash deploy.sh          # website files only
#   bash deploy.sh --api    # website + contact-form backend (restarts pm2 app)
set -euo pipefail
KEY="${KEY:-$HOME/.ssh/hetzner_46}"
HOST="deploy@46.62.231.109"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST")
cd "$(dirname "$0")"

tar -cf - 404.html about.html approach.html contact.html index.html services.html robots.txt sitemap.xml css js \
  | "${SSH[@]}" "mkdir -p /var/www/peoplefirst.ink && tar -xf - -C /var/www/peoplefirst.ink && chmod -R a+rX /var/www/peoplefirst.ink && echo 'Site deployed to /var/www/peoplefirst.ink'"

if [ "${1:-}" = "--api" ]; then
  tar -cf - -C server/contact server.js package.json ecosystem.config.js \
    | "${SSH[@]}" "mkdir -p /var/www/peoplefirst-contact && tar -xf - -C /var/www/peoplefirst-contact && cd /var/www/peoplefirst-contact && npm install --omit=dev --no-audit --no-fund >/dev/null && (pm2 describe peoplefirst-contact >/dev/null 2>&1 && pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js) >/dev/null && pm2 save >/dev/null && sleep 1 && curl -s http://127.0.0.1:8791/api/health && echo && echo 'API deployed and healthy'"
fi
