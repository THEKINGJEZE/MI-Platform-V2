/**
 * PM2 Ecosystem Config — Dashboard
 *
 * Usage on VPS:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'mi-dashboard',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/dashboard.peelplatforms.co.uk',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/mi-dashboard-error.log',
      out_file: '/var/log/pm2/mi-dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
