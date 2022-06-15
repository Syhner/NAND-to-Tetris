const fs = require('fs');

class CodeWriter {
  // Opens the output file and gets ready to write
  // to it.
  constructor(inFile) {
    this.inFile = inFile;
    const inFileArr = inFile.split('/');
    const inFileNameVm = inFileArr[inFileArr.length - 1];
    this.inFileName = inFileNameVm.substring(0, inFileNameVm.length - 3);

    this.output = [];
    this.compareCount = 0;
  }

  comment(line) {
    this.output.push(`// ${line}`);
  }

  incrementStackPointer() {
    this.output.push('@SP', 'M=M+1');
  }

  accessTop() {
    // Side effect: decrements the stack pointer
    this.output.push('@SP', 'M=M-1', 'A=M');
  }

  pushToStack() {
    this.output.push('@SP', 'A=M', `M=D`);
    this.incrementStackPointer();
  }

  popFromStack() {
    this.accessTop();
    this.output.push('D=M');
  }

  unaryOp(operation) {
    this.accessTop();
    this.output.push(`M=${operation}M`);
    this.incrementStackPointer();
  }

  binaryOp(operation) {
    this.popFromStack();
    this.accessTop();
    this.output.push(`M=M${operation}D`);
    this.incrementStackPointer();
  }

  compareOp(condition) {
    this.compareCount++;

    const currentTrue = `TRUE.${this.compareCount}`;
    const currentContinue = `CONTINUE.${this.compareCount}`;

    this.popFromStack();
    this.accessTop();
    this.output.push('D=M-D');
    // Jump to true block if conditional is true
    this.output.push(`@${currentTrue}`, `D;${condition}`);
    // False block
    this.output.push('@SP', 'A=M', `M=0`);
    this.incrementStackPointer();
    this.output.push(`@${currentContinue}`, '0;JMP');
    // True block
    this.output.push(`(${currentTrue})`);
    this.output.push('@SP', 'A=M', `M=-1`);
    this.incrementStackPointer();
    // Continue if false
    this.output.push(`(${currentContinue})`);
  }

  // Writes to the output file the assembly code
  // that implements the given arithmetic command.
  writeArithmetic(command) {
    switch (command) {
      case 'add':
        return this.binaryOp('+');
      case 'sub':
        return this.binaryOp('-');
      case 'neg':
        return this.unaryOp('-');
      case 'eq':
        return this.compareOp('JEQ');
      case 'gt':
        return this.compareOp('JGT');
      case 'lt':
        return this.compareOp('JLT');
      case 'and':
        return this.binaryOp('&');
      case 'or':
        return this.binaryOp('|');
      case 'not':
        return this.unaryOp('!');
    }
  }

  segmentCode(segment) {
    const segmentCodes = {
      local: 'LCL',
      argument: 'ARG',
      this: 'THIS',
      that: 'THAT',
    };

    return segmentCodes[segment];
  }

  int(int) {
    this.output.push(`@${int}`, 'D=A');
  }

  // Writes to the output file the assembly code
  // that implements the given command, where
  // command is either C_PUSH or C_POP
  writePushPop(command, segment, int) {
    switch (segment) {
      case 'local':
      case 'argument':
      case 'this':
      case 'that':
        const segCode = this.segmentCode(segment);

        if (command === 'C_PUSH') {
          this.int(int);
          this.output.push(`@${segCode}`, 'A=D+M', 'D=M');
          this.pushToStack();
        } else {
          this.int(int);
          this.output.push(`@${segCode}`, 'D=D+M', '@R13', 'M=D');
          this.popFromStack();
          this.output.push('@R13', 'A=M', 'M=D');
        }
        break;

      case 'constant':
        this.output.push(`@${int}`, 'D=A');
        this.pushToStack();
        break;

      case 'static':
        if (command === 'C_PUSH') {
          this.output.push(`@${this.inFileName}.${int}`, 'D=M');
          this.pushToStack();
        } else {
          this.popFromStack();
          this.output.push(`@${this.inFileName}.${int}`, 'M=D');
        }
        break;

      case 'pointer':
        const pointer = int === '0' ? '@THIS' : '@THAT';

        if (command === 'C_PUSH') {
          this.output.push(pointer, 'D=M');
          this.pushToStack();
        } else {
          this.popFromStack();
          this.output.push(pointer, 'M=D');
        }
        break;

      case 'temp':
        if (command === 'C_PUSH') {
          this.int(int);
          this.output.push('@R5', 'A=D+A', 'D=M');
          this.pushToStack();
        } else {
          this.int(int);
          this.output.push('@R5', 'A=D+A', 'D=M', '@R13', 'M=D');
          this.popFromStack();
          this.output.push('@R13', 'A=M', 'M=D');
        }
        break;
    }
  }

  // Closes the output file
  close() {
    const { inFile } = this;
    const outFileName = `${inFile.substring(0, inFile.length - 3)}.asm`;
    fs.writeFileSync(outFileName, this.output.join('\n'));
  }
}

module.exports = CodeWriter;
