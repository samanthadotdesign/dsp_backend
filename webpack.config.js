// Generated using webpack-cli https://github.com/webpack/webpack-cli
const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: [
    './index.mjs',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
  externals: nodeModules,
  target: 'node',
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
