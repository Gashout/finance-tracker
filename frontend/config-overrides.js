/**
 * @file config-overrides.js
 * @description Custom webpack configuration for path aliases
 * 
 * This file extends the default Create React App webpack configuration
 * to support path aliases defined in tsconfig.json without ejecting.
 * 
 * It uses react-app-rewired to override the default webpack config.
 */

const path = require('path');

module.exports = function override(config) {
  // Add path alias resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src')
  };

  return config;
};
