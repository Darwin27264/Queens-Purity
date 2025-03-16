// craco.config.js
const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  webpack: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // Remove the ModuleScopePlugin which prevents importing modules from outside of src
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin)
      );

      // Optionally, keep the filtering for @antv source maps if needed
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use) {
          rule.use.forEach((u) => {
            if (u.loader && u.loader.includes('source-map-loader')) {
              u.options = {
                filterSourceMappingUrl: (url, resourcePath) => {
                  if (resourcePath.includes('@antv')) {
                    return false;
                  }
                  return true;
                },
              };
            }
          });
        }
      });

      return webpackConfig;
    },
  },
};
