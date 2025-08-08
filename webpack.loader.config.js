import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './public/chatbot-loader.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'chatbot-loader.js',
    clean: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: 'FRONTEND_URL_PLACEHOLDER',
            replace: process.env.FRONTEND_URL || 'http://localhost:5173'
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs for debugging
            drop_debugger: true
          },
          mangle: false, // Don't mangle to keep function names readable
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL || 'http://localhost:5173')
    })
  ]
}; 