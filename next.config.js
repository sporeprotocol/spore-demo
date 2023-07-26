const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      encoding: false,
      path: false,
      fs: false,
      stream: false,
    };

    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    ];
    return config;
  },
};

module.exports = nextConfig;
