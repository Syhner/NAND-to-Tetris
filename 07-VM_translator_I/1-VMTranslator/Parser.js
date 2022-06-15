const fs = require('fs');

class Parser {
  /* Opens the input file and gets ready to parse it. */
  constructor(inFile) {
    this.file = fs.readFileSync(inFile, 'utf-8').split(/[\r\n]+/);
    this.totalLines = this.file.length;
    this.currentLine = 0;
  }

  /* Are there more commands in the input */
  hasMoreCommands() {
    return this.currentLine < this.totalLines;
  }

  /* Reads the next command from the input and makes it the current command. 
  Should be called only if hasMoreCommands() is true. Initially there is no
  current command. */
  advance() {
    this.currentLine++;
    this.currentCmd = this.file[this.currentLine - 1]
      .replace(/\s*\/\/.*/, '')
      .trim();
    const [command, arg1, arg2] = this.currentCmd.split(' ');
    this.command = command;
    this.arg1 = arg1;
    this.arg2 = arg2;
  }

  /* Returns a constant representing the type of the current command. 
  C_ARITHMETIC is returned for all the arithmetic/logical commands. */
  commandType() {
    if (this.currentCmd === '') return 'BLANK';

    const arithmeticCodes = [
      'add',
      'sub',
      'neg',
      'eq',
      'gt',
      'lt',
      'and',
      'or',
      'not',
    ];

    if (arithmeticCodes.includes(this.command)) return 'C_ARITHMETIC';

    const commandMap = { push: 'C_PUSH', pop: 'C_POP' };
    return commandMap[this.command];
  }
}

module.exports = Parser;
