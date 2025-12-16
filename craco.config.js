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

      // Suppress source map warnings for @antv packages
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.use) {
          rule.use.forEach((u) => {
            if (u.loader && u.loader.includes('source-map-loader')) {
              u.options = {
                filterSourceMappingUrl: (url, resourcePath) => {
                  // Suppress source map warnings for @antv and other problematic packages
                  if (resourcePath.includes('@antv') || 
                      resourcePath.includes('node_modules')) {
                    return false;
                  }
                  return true;
                },
              };
            }
          });
        }
      });
      
      // Suppress source map warnings in webpack
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /ENOENT: no such file or directory/,
      ];

      // Suppress webpack-dev-server deprecation warnings
      if (webpackConfig.devServer) {
        // Remove deprecated middleware options to suppress warnings
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;
      }

      // Production optimizations
      if (env === 'production') {
        // Enable source maps for production debugging (optional - remove if you want smaller bundle)
        webpackConfig.devtool = 'source-map';
        
        // Optimize chunk splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
              },
              antd: {
                test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
                name: 'antd',
                priority: 20,
              },
            },
          },
        };
      }

      return webpackConfig;
    },
  },
};
