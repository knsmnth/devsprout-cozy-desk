const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/store/useTaskStore.js', 'utf8');

// Try with different targets
for (let target of [ts.ScriptTarget.ES5, ts.ScriptTarget.ES2015, ts.ScriptTarget.ES2018, ts.ScriptTarget.ES2020, ts.ScriptTarget.ES2022]) {
  const sf = ts.createSourceFile('useTaskStore.js', code, target, true, ts.ScriptKind.JS);
  console.log(`Target ${ts.ScriptTarget[target]} diagnostics:`, sf.parseDiagnostics.length);
  if (sf.parseDiagnostics.length > 0) {
    sf.parseDiagnostics.forEach(d => {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
      console.log(`  Line ${line + 1}, col ${character + 1}: ${d.messageText} (code ${d.code})`);
    });
  }
}

