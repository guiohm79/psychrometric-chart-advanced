import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    file: 'psychrometric-chart-advanced.js',
    format: 'iife',
    name: 'PsychrometricChart',
    sourcemap: !isProduction,
    banner: `/**
 * Psychrometric Chart Card for Home Assistant
 * Version: 2.0.0
 * Author: guiohm79
 * License: MIT
 */`
  },
  plugins: [
    // Resolve node modules
    resolve({
      browser: true,
      preferBuiltins: false
    }),

    // Handle CommonJS modules
    commonjs(),

    // Process CSS files and inline them
    postcss({
      inject: true,
      minimize: isProduction,
      sourceMap: !isProduction
    }),

    // Compile TypeScript
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      sourceMap: !isProduction
    }),

    // Minify in production
    isProduction && terser({
      format: {
        comments: /^!/
      },
      compress: {
        drop_console: false,
        pure_funcs: []
      }
    })
  ].filter(Boolean),

  // Suppress warnings
  onwarn(warning, warn) {
    // Ignore circular dependency warnings (common in complex apps)
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    // Use default for everything else
    warn(warning);
  }
};
