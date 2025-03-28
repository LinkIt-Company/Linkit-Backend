import CopyPlugin from 'copy-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';

const swaggerUiModulePath = path.dirname(require.resolve('swagger-ui-dist'));

module.exports = {
  entry: './src/handler.ts',
  mode: 'none',
  target: 'node',
  devtool: 'source-map',
  plugins: [
    // sentryWebpackPlugin({
    //   org: 'mashup-linkit',
    //   project: 'linkit-tracker',
    //   authToken: process.env.SENTRY_AUTH_TOKEN,
    // }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          './swagger-ui-bundle.js',
          './swagger-ui-standalone-preset.js',
          'class-validator',
          'class-transformer/storage',
          '@nestjs/swagger',
          'fastify-swagger',
          '@nestjs/microservices',
          '@nestjs/platform-fastify',
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          // mongodb optionals
          'mongodb-client-encryption',
          'bson-ext',
          'kerberos',
          'aws4',
          'snappy',
          'gcp-metadata',
          '@mongodb-js/zstd',
          'snappy/package.json',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: `${swaggerUiModulePath}/swagger-ui.css`,
          to: 'swagger-ui.css',
        },
        {
          from: `${swaggerUiModulePath}/swagger-ui-bundle.js`,
          to: 'swagger-ui-bundle.js',
        },
        {
          from: `${swaggerUiModulePath}/swagger-ui-standalone-preset.js`,
          to: 'swagger-ui-standalone-preset.js',
        },
        {
          from: `${swaggerUiModulePath}/favicon-32x32.png`,
          to: 'favicon-32x32.png',
        },
        {
          from: `${swaggerUiModulePath}/favicon-16x16.png`,
          to: 'favicon-16x16.png',
        },
        {
          from: `${swaggerUiModulePath}/oauth2-redirect.html`,
          to: 'src/oauth2-redirect.html',
        },
      ],
    }),
  ],
  externals: {
    '@aws-sdk': '@aws-sdk',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'swc-loader' }],
  },
  stats: {
    warningsFilter: [
      'optional-require',
      'load-package.util',
      'load-adapter',
      () => false,
    ],
  },
};
