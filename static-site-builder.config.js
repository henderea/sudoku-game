const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = function(env, mode, paths) {
  if(mode === 'production') {
    // extra environment content
    const envOverride = {};
    return {
      env: _.extend({}, env, envOverride),
      // extra webpack plugins
      plugins: [],
      // webpack config overrides
      webpack: {
        optimization: {
          splitChunks: {
            cacheGroups: {
              boards: {
                test: /resources\/boards\.json/,
                name: 'boards',
                chunks: 'all'
              }
            }
          }
        }
      },
      // moment.js locales to keep: use null to not trim, use '' for default locale only, or a comma-separated list of locales to keep in addition to the default
      momentLocales: '',
      // the severity of the size hints warning: use false for disabling, 'warning' for warning (default; used with null), or 'error' for failing the build
      sizeHints: null,
      // the max size of the entrypoint above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
      maxEntrypointSize: null,
      // the max size of assets above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
      maxAssetSize: null,
      // extra loaders to add to the start of the list
      extraLoaders: [],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
      // override options for postcss
      // postcssOptions: {
      //   plugins: ['postcss-preset-env']
      // },
    };
  } else {
    // extra environment content
    const envOverride = {};
    return {
      env: _.extend({}, env, envOverride),
      // extra webpack plugins
      plugins: [],
      // webpack config overrides
      webpack: {},
      // extra loaders to add to the start of the list
      extraLoaders: [],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
      // override options for postcss
      // postcssOptions: {
      //   plugins: ['postcss-preset-env']
      // },
    };
  }
};
