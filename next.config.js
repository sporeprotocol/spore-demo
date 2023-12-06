const webpack = require('webpack');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  headers: () => {
    return [
      {
        source: '/api/graphql',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
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

    config.resolve.alias = {
      ...config.resolve.alias,
      'cross-fetch': path.resolve(__dirname, './fetch.ponyfill.js'),
    };

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
