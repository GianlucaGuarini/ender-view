import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'index.ts',
  output: [
    {
      dir: './dist',
      sourcemap: true,
      format: 'es',
    },
    {
      file: './dist/index.umd.js',
      name: 'EnderView',
      sourcemap: true,
      format: 'umd',
    },
  ],
  plugins: [typescript(), commonjs(), resolve(), terser()],
}
