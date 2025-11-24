module.exports = {
    apps: [
        {
            name: 'event2one-saas',
            script: 'server.js',
            cwd: '/var/www/event2one-saas',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3002
            },
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true
        }
    ]
};
