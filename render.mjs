import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Bundling...');
  const bundleLocation = await bundle({
    entryPoint: path.join(__dirname, 'src/index.jsx'),
    webpackOverride: (config) => config,
  });

  const chromiumPath = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
  console.log('Selecting composition...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'ColorshopPresentation',
    browserExecutable: chromiumPath,
  });

  console.log('Rendering video...');
  if (!fs.existsSync(path.join(__dirname, 'out'))) {
    fs.mkdirSync(path.join(__dirname, 'out'));
  }

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: path.join(__dirname, 'out/colorshop-presentation.mp4'),
    browserExecutable: chromiumPath,
    onProgress: ({ progress }) => {
      process.stdout.write(`\rProgress: ${Math.round(progress * 100)}%`);
    },
  });

  console.log('\nDone! Video saved to out/colorshop-presentation.mp4');
}

main().catch(console.error);
