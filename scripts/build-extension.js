import { build } from 'esbuild';

await build({
  entryPoints: [
    'extension/popup/popup.js'
  ],

  bundle: true,

  outfile:
    'extension/dist/popup.js',

  format: 'iife',

  platform: 'browser',

  target: [
    'chrome120'
  ],

  minify: false
});

console.log(
  'Extension bundle generated.'
);