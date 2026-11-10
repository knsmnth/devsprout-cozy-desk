const ts = require('typescript');

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'jsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

const program = ts.createProgram({
  rootNames: parsedConfig.fileNames,
  options: parsedConfig.options
});

const diagnostics = ts.getPreEmitDiagnostics(program);
console.log('Total pre-emit diagnostics:', diagnostics.length);
diagnostics.forEach(d => {
  if (d.file) {
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    console.log(`${d.file.fileName} (${line + 1},${character + 1}): ${ts.flattenDiagnosticMessageText(d.messageText, '\n')} [code ${d.code}]`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  }
});

