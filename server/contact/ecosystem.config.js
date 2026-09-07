module.exports = {
  apps: [{
    name: 'peoplefirst-contact',
    script: 'server.js',
    cwd: '/var/www/peoplefirst-contact',
    env: { NODE_ENV: 'production', PORT: 8791 },
    max_memory_restart: '100M',
    autorestart: true
  }]
};
