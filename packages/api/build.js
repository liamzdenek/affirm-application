#!/usr/bin/env node
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bundle() {
  console.log('Bundling API with esbuild...');
  
  // Create dist directory if it doesn't exist
  const distDir = join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Create separate directories for each Lambda function
  const apiDir = join(distDir, 'api');
  const aggregationDir = join(distDir, 'aggregation');
  
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  if (!fs.existsSync(aggregationDir)) {
    fs.mkdirSync(aggregationDir, { recursive: true });
  }

  try {
    // Bundle the API handler
    await build({
      entryPoints: [join(__dirname, 'src/index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: join(apiDir, 'index.js'),
      external: [],
      format: 'cjs', // Use CommonJS format instead of ESM
      banner: {
        js: '// Generated with esbuild',
      },
      minify: false,
      sourcemap: 'external',
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      mainFields: ['main', 'module'],
      nodePaths: [join(__dirname, 'node_modules')],
    });

    // Create a minimal package.json for the API bundle
    const apiPackageJson = {
      name: '@affirm-merchant-analytics/api-bundle',
      version: '0.0.1',
      private: true,
      main: 'index.js',
    };

    fs.writeFileSync(
      join(apiDir, 'package.json'),
      JSON.stringify(apiPackageJson, null, 2)
    );

    // Bundle the aggregation handler
    await build({
      entryPoints: [join(__dirname, 'src/aggregation.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: join(aggregationDir, 'aggregation.js'),
      external: [],
      format: 'cjs', // Use CommonJS format instead of ESM
      banner: {
        js: '// Generated with esbuild',
      },
      minify: false,
      sourcemap: 'external',
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      mainFields: ['main', 'module'],
      nodePaths: [join(__dirname, 'node_modules')],
    });

    // Create a minimal package.json for the aggregation bundle
    const aggregationPackageJson = {
      name: '@affirm-merchant-analytics/aggregation-bundle',
      version: '0.0.1',
      private: true,
      main: 'aggregation.js',
    };

    fs.writeFileSync(
      join(aggregationDir, 'package.json'),
      JSON.stringify(aggregationPackageJson, null, 2)
    );

    console.log('Bundles created successfully at:');
    console.log('- API:', apiDir);
    console.log('- Aggregation:', aggregationDir);
  } catch (error) {
    console.error('Bundling failed:', error);
    process.exit(1);
  }
}

bundle();