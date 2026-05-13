module.exports = {
    apps: [
        {
            name: 'event2one-saas',
            script: 'server.js',
            cwd: '/var/www/e2o/event2one-saas',
            instances: 1,
            exec_mode: 'cluster',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: 3002,
                BADGE_TOKEN_SECRET: '74058700ff047678ac910885baed6f85fc82d72e05742c0c12726ae1fa544777'
            },
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true
        }
    ]
};
