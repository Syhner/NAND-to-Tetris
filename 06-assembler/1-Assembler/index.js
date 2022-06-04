const fs = require('fs');
const symbolTable = require('./symbolTable');
const parse = require('./parse');
const code = require('./code');

const inFileName = process.argv[2];
const inFile = fs.readFileSync(inFileName, 'utf-8').split(/[\r\n]+/);

/* 
First pass:
Remove comments, whitespace, and labels
Add labels to symbol table
*/
const firstOutput = [];
inFile.forEach(line => {
  const lineTrimmed = line.replace(/\s*\/\/.*/, '').trim();

  const isLabel = lineTrimmed.startsWith('(');
  const isEmpty = lineTrimmed === '';

  if (isLabel) {
    const symbol = lineTrimmed.substring(1, lineTrimmed.length - 1);
    const address = firstOutput.length;
    symbolTable.addSymbol(symbol, address);
  } else if (!isEmpty) {
    firstOutput.push(lineTrimmed);
  }
});

/* 
Second pass:
Replace @symbol with @number
Replace @number with binary representation
Replace dest=comp;jump with binary representation
*/
const secondOutput = [];
firstOutput.forEach(line => {
  const isAInstruction = line.startsWith('@');
  const isAInstructionSymbol = isAInstruction && isNaN(line.substring(1));

  // A-instruction with symbol
  if (isAInstructionSymbol) {
    const symbol = line.substring(1);
    const address = symbolTable.getAddress(symbol);
    line = `@${address}`;
  }

  // A-instruction with number
  if (isAInstruction) {
    const number = line.substring(1);
    const binary = Number(number).toString(2);
    const binary16 = '0'.repeat(16 - binary.length) + binary;
    secondOutput.push(binary16);
  }

  // C-instruction
  else {
    const { dest, comp, jump } = parse(line);
    const { destCode, compCode, jumpCode } = code({ dest, comp, jump });
    const codeLine = `111${compCode}${destCode}${jumpCode}`;
    secondOutput.push(codeLine);
  }
});

const outFileName = `${inFileName.substring(0, inFileName.length - 4)}.hack`;
fs.writeFileSync(outFileName, secondOutput.join('\n'));
