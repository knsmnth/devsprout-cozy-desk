const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/store/useTaskStore.js', 'utf8');

const sf = ts.createSourceFile('useTaskStore.ts', code, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
console.log('TS parseDiagnostics as TS:', sf.parseDiagnostics.length);
sf.parseDiagnostics.forEach(d => {
  const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
  console.log(`  Line ${line + 1}, col ${character + 1}: ${d.messageText} (code ${d.code})`);
});

