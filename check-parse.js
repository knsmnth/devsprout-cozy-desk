const fs = require('fs');
const acorn = require('next/dist/compiled/acorn');

const code = fs.readFileSync('src/store/useTaskStore.js', 'utf8');

try {
  const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });
  console.log('File successfully parsed with Acorn!');
  console.log('Top level statement count:', ast.body.length);
  ast.body.forEach((stmt, i) => {
    console.log(`Stmt ${i}: ${stmt.type} at lines ${stmt.loc.start.line}-${stmt.loc.end.line}`);
  });
} catch (err) {
  console.error('PARSE ERROR at', err.loc, ':', err.message);
}

