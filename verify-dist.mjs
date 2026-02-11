import { readFileSync, existsSync } from 'fs';

const errors = [];

// 1. dist/index.html must exist
if (!existsSync('dist/index.html')) {
  errors.push('dist/index.html not found');
} else {
  const html = readFileSync('dist/index.html', 'utf-8');

  // 2. Must NOT reference /src/main.jsx (that's the source, not build)
  if (html.includes('/src/main.jsx')) {
    errors.push('dist/index.html still references /src/main.jsx — this is the source file, not build output!');
  }

  // 3. Must reference hashed JS bundle
  if (!html.includes('/my-ecosystem/assets/index-')) {
    errors.push('dist/index.html does not reference /my-ecosystem/assets/index-*.js — base path may be wrong');
  }

  // 4. Must have the <div id="root">
  if (!html.includes('id="root"')) {
    errors.push('dist/index.html missing <div id="root">');
  }
}

// 5. Assets directory must exist with JS and CSS
if (!existsSync('dist/assets')) {
  errors.push('dist/assets/ directory not found');
}

// 6. .nojekyll must be present
if (!existsSync('dist/.nojekyll')) {
  errors.push('dist/.nojekyll not found — GitHub Pages may not serve files correctly');
}

if (errors.length > 0) {
  console.error('\n❌ Deploy verification FAILED:\n');
  errors.forEach(e => console.error('  • ' + e));
  console.error('');
  process.exit(1);
} else {
  console.log('✅ Deploy verification passed — dist/ looks correct');
}
