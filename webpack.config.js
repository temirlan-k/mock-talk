const nodeExternals = require('webpack-node-externals');

module.exports = {
    // other configurations
    target: 'web',
    externals: [nodeExternals()],
    // other configurations
};
