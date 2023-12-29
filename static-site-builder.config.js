const _ = require('lodash');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = function(env, mode, paths) {
  // extra environment content for both environments
  const commonEnvOverride = {};
  // extra loaders to add to the start of the list for both environments
  const commonExtraLoaders = [
    {
      test: /\.tsx$/,
      exclude: [/[/\\\\]node_modules[/\\\\]/],
      use: [
        require.resolve('thread-loader'),
        {
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            compact: true,
            highlightCode: true,
            configFile: false,
            presets: ['@babel/preset-env', 'solid', '@babel/preset-typescript'],
            plugins: ['@babel/syntax-dynamic-import', '@babel/transform-class-properties', '@babel/transform-object-rest-spread']
          },
        },
      ]
    },
    {
      test: /\.svg$/,
      exclude: [/[/\\\\]node_modules[/\\\\]/],
      use: 'raw-loader'
    }
  ];
  if(mode === 'production') {
    // extra environment content
    const envOverride = { ...commonEnvOverride };
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
      maxEntrypointSize: '1m',
      // the max size of assets above which webpack will warn: use null to keep the default, or specify a size with the suffix b, k, m, or g
      maxAssetSize: '1m',
      // extra loaders to add to the start of the list
      extraLoaders: [...commonExtraLoaders],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
      // override options for postcss
      // postcssOptions: {
      //   plugins: ['postcss-preset-env']
      // },
    };
  } else {
    // extra environment content
    const envOverride = { ...commonEnvOverride };
    return {
      env: _.extend({}, env, envOverride),
      // extra webpack plugins
      plugins: [],
      // webpack config overrides
      webpack: {},
      // extra loaders to add to the start of the list
      extraLoaders: [...commonExtraLoaders],
      // extra options for the HtmlWebpackPlugin
      htmlWebpackPluginOptions: {},
      // override options for postcss
      // postcssOptions: {
      //   plugins: ['postcss-preset-env']
      // },
    };
  }
};
