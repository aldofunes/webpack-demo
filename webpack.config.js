const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
require('dotenv').config();
const stylelint = require('stylelint');
const pkg = require('./package.json');

const parts = require('./libs/parts');

process.env.BABEL_ENV = process.env.npm_lifecycle_event;

const PATHS = {
  app: path.join(__dirname, 'app'),
  style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'main.css'),
  ],
  build: path.join(__dirname, 'build')
};

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's convenient with more complex configurations
  entry: {
    style: PATHS.style,
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    }),
  ],
  module: {
    preLoaders: [
      {
        test: /\.css?$/,
        loaders: ['postcss'],
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        include: PATHS.app
      }
    ]
  },
  postcss: function () {
    return [
      stylelint({
        rules: {
          'color-hex-case': 'lower'
        }
      })
    ];
  }
};

var config;

// Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup will work without this, but is useful to set
          chunkFilename: '[chunkhash].js',
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
        },
        resolve: {
          alias: {
            'react': 'react-lite',
            'react-dom': 'react-lite'
          }
        }
      },
      parts.react(PATHS.app),
      parts.clean(PATHS.build),
      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app]),
      parts.setFreeVariable('process.env.NODE_ENV', 'production'),
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      parts.minify()
    );
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
      parts.react(PATHS.app),
      parts.setupCSS(PATHS.style),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = validate(config, {
  quiet: true
});
