#!/usr/bin/env bash
# Deploy peoplefirst.ink to the Hetzner server. Run from the project folder in Git Bash:
#   bash deploy.sh          # website files only
#   bash deploy.sh --api    # website + contact-form backend (restarts pm2 app)
# CSS/JS links get a ?v=<hash> so browsers pick up changes despite 24h caching.
set -euo pipefail
KEY="${KEY:-$HOME/.ssh/hetzner_46}"
HOST="deploy@46.62.231.109"
SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes "$HOST")
cd "$(dirname "$0")"

VER=$(cat css/styles.css css/fonts.css js/main.js | (sha1sum 2>/dev/null || shasum) | cut -c1-8)
BUILD=$(mktemp -d)
cp -r css js fonts robots.txt sitemap.xml "$BUILD"/
for f in 404.html about.html approach.html contact.html index.html services.html; do
  sed -e "s#css/styles\.css\(?v=[^\"]*\)\?#css/styles.css?v=$VER#g" \
      -e "s#css/fonts\.css\(?v=[^\"]*\)\?#css/fonts.css?v=$VER#g" \
      -e "s#js/main\.js\(?v=[^\"]*\)\?#js/main.js?v=$VER#g" "$f" > "$BUILD/$f"
done
echo "Asset version: $VER"

tar -cf - -C "$BUILD" . \
  | "${SSH[@]}" "mkdir -p /var/www/peoplefirst.ink && tar -xf - -C /var/www/peoplefirst.ink && chmod -R a+rX /var/www/peoplefirst.ink && echo 'Site deployed to /var/www/peoplefirst.ink'"
rm -rf "$BUILD"

if [ "${1:-}" = "--api" ]; then
  tar -cf - -C server/contact server.js package.json ecosystem.config.js \
    | "${SSH[@]}" "mkdir -p /var/www/peoplefirst-contact && tar -xf - -C /var/www/peoplefirst-contact && cd /var/www/peoplefirst-contact && npm install --omit=dev --no-audit --no-fund >/dev/null && (pm2 describe peoplefirst-contact >/dev/null 2>&1 && pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js) >/dev/null && pm2 save >/dev/null && sleep 1 && curl -s http://127.0.0.1:8791/api/health && echo && echo 'API deployed and healthy'"
fi
