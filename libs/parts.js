const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');

exports.devServer = function (options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based routing works.
      // This is a good default that will come in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // 0.0.0.0 is available to all network devices unlike default 'localhost'
      host: options.host, // defaults to 'localhost'
      port: options.port // defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance in larger projects
      // Good default
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
};

exports.setupCSS = function (paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: paths
        }
      ]
    }
  };
};

exports.minify = function () {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
};

exports.setFreeVariable = function (key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
};

exports.extractBundle = function (options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting
    entry: entry,
    plugins: [
      // Extract bundle and manifest files.
      // Manifest is needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        name: [options.name, 'manifest']
      })
    ]
  };
};

exports.clean = function (path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without 'root' CleanWebpackPlugin won't point to out project and wil fail to work
        root: process.cwd()
      })
    ]
  };
};

exports.extractCSS = function (paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: (paths)
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  }
};

exports.purifyCSS = function (paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // 'paths' is used to poing PurifyCSS to files not visible to Webpack.
        // You can pass glob patterns to it
        paths: paths
      })
    ]
  };
};

exports.react = function (path) {
  return {
    // Important! Do not remove ''. If you do, imports without an extension won't work anymore
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          // Enable caching for improved performance during development. It uses default OS
          // directory by default. If you need something more custom, pass a path to it.
          // I. e., babel?cacheDirectory=<path>
          loaders: ['babel?cacheDirectory'],
          // Parse only app files! Without this it will go through the entire project. In addition
          // to being slow, that will most likely result in an error
          include: path
        },
        {
          test: require.resolve('react'),
          loader: 'expose?React'
        }
      ]
    }
  }
};
