const fs = require('fs');

class Parser {
  /* Opens the input file and gets ready to parse it. */
  constructor(filePaths) {
    this.files = filePaths.map(filePath =>
      fs.readFileSync(filePath, 'utf-8').split(/[\r\n]+/)
    );

    this.currFileIdx = 0;
    this.currFile = this.files[this.currFileIdx];
    this.currFileLines = this.currFile.length;
    this.currLineNumber = 0;
  }

  /* Are there more commands in the input */
  hasMoreCommands() {
    return (
      this.currFileIdx !== this.files.length - 1 ||
      this.currLineNumber < this.currFileLines
    );
  }

  /* Reads the next command from the input and makes it the current command. 
  Should be called only if hasMoreCommands() is true. Initially there is no
  current command. */
  advance() {
    if (this.currLineNumber === this.currFileLines) {
      this.currFileIdx++;
      this.currFile = this.files[this.currFileIdx];
      this.currFileLines = this.currFile.length;
      this.currLineNumber = 0;
    }
    this.currCmd = this.currFile[this.currLineNumber]
      .replace(/\s*\/\/.*/, '')
      .trim();
    const [command, arg1, arg2] = this.currCmd.split(' ');
    this.command = command;
    this.arg1 = arg1;
    this.arg2 = arg2;

    this.currLineNumber++;
  }

  nextFile() {}

  /* Returns a constant representing the type of the current command. 
  C_ARITHMETIC is returned for all the arithmetic/logical commands. */
  commandType() {
    if (this.currCmd === '') return 'BLANK';

    const { command } = this;

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

    if (arithmeticCodes.includes(command)) return 'C_ARITHMETIC';

    switch (command) {
      case 'push':
        return 'C_PUSH';
      case 'pop':
        return 'C_POP';
      case 'goto':
        return 'C_GOTO';
      case 'if-goto':
        return 'C_IF';
      case 'label':
        return 'C_LABEL';
      case 'call':
        return 'C_CALL';
      case 'function':
        return 'C_FUNCTION';
      case 'return':
        return 'C_RETURN';
    }
  }
}

module.exports = Parser;
