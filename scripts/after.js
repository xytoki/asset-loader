// mv dist/runtime/index.js to dist/runtime/index.mjs
const fs = require('fs');
const path = require('path');
const dist = path.resolve(__dirname, '../dist/runtime');
const index = path.resolve(dist, 'index.js');
const indexMjs = path.resolve(dist, 'index.mjs');
fs.renameSync(index, indexMjs);