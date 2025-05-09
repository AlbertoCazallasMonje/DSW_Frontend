const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/users',
        createProxyMiddleware({
            target: 'http://localhost:3000',
            changeOrigin: true,
        })
    );

    app.use(
        '/accounts',
        createProxyMiddleware({
            target: 'http://localhost:3002',
            changeOrigin: true,
        })
    );

    app.use('/action', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
    app.use('/passwordUpdate', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
};
