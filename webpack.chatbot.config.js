import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './src/components/chatbot-embed/index.tsx',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'chatbot-bundle.js',
    library: {
      name: 'RankVedChatbot',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'window',
    clean: false
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.chatbot.json',
            transpileOnly: true, // Faster compilation
            compilerOptions: {
              target: 'es2018',
              module: 'esnext',
              moduleResolution: 'node',
              allowSyntheticDefaultImports: true,
              esModuleInterop: true,
              skipLibCheck: true,
              forceConsistentCasingInFileNames: true,
              strict: false, // Disable strict mode for smaller bundle
              noEmit: false,
              isolatedModules: false,
              allowImportingTsExtensions: false
            }
          }
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/inline',
      },
    ],
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console logs for debugging
            drop_debugger: true,
            pure_funcs: [], // Don't remove console functions
            passes: 2,
            unsafe: true,
            unsafe_comps: true,
            unsafe_Function: true,
            unsafe_math: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true
          },
          mangle: {
            safari10: true,
            toplevel: true
          },
          format: {
            comments: false,
            ascii_only: true
          }
        },
        extractComments: false
      }),
    ],
    splitChunks: false, // No code splitting for single bundle
    usedExports: true, // Enable tree shaking
    sideEffects: false // Assume no side effects for better tree shaking
  },
  performance: {
    hints: false,
    maxEntrypointSize: 256000, // Reduced from 512000
    maxAssetSize: 256000 // Reduced from 512000
  },
  stats: {
    chunks: false,
    modules: false,
    children: false,
    warnings: false
  }
}; 