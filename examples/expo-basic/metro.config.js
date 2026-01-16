const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const sdkPath = path.resolve(__dirname, '../../packages/sdk-react-native');

// Watch the SDK source for development
config.watchFolders = [sdkPath];

// Make sure the SDK resolves dependencies from this project's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Ensure we don't have duplicate React instances
config.resolver.extraNodeModules = {
  'react': path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
};

module.exports = config;
