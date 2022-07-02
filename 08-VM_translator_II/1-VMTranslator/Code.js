const fs = require('fs');

class CodeWriter {
  // Opens the output file and gets ready to write
  // to it.
  constructor(dir, fileName) {
    this.dir = dir;
    this.fileName = fileName;

    this.output = [];
    this.compareCounter = 0;
    this.functionCounter = 0;

    // this.writeInit();
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
    this.compareCounter++;

    const currentTrue = `TRUE.${this.compareCounter}`;
    const currentContinue = `CONTINUE.${this.compareCounter}`;

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
          this.output.push(`@${this.fileName}.${int}`, 'D=M');
          this.pushToStack();
        } else {
          this.popFromStack();
          this.output.push(`@${this.fileName}.${int}`, 'M=D');
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

  writeInit() {
    this.output.push('@256', 'D=A', '@SP', 'M=D');
    this.writeCall('Sys.init', 0);
  }

  writeLabel(label) {
    this.output.push(`(${label})`);
  }

  writeGoto(label) {
    this.output.push(`@${label}`, '0;JMP');
  }

  writeIf(label) {
    this.popFromStack();
    this.output.push(`@${label}`, 'D;JNE');
  }

  writeFunction(functionName, numVars) {
    this.writeLabel(functionName);

    this.int('0');
    for (let i = 0; i < numVars; i++) {
      this.pushToStack();
    }
  }

  savePointer(pointer) {
    this.output.push(`@${pointer}`, 'D=M');
    this.pushToStack();
  }

  restorePointer(pointer) {
    this.output.push('@ENDFRAME', 'M=M-1', 'A=M', 'D=M');
    this.output.push(`@${pointer}`, 'M=D');
  }

  writeCall(functionName, numArgs) {
    this.functionCounter++;

    // Push return address
    this.output.push(`@RETURN.${this.functionCounter}`, 'D=A');
    this.pushToStack();

    // Save pointers
    this.savePointer('LCL');
    this.savePointer('ARG');
    this.savePointer('THIS');
    this.savePointer('THAT');

    // Reposition ARG pointer
    this.output.push('@SP', 'D=M', `@${parseInt(numArgs) + 5}`, 'D=D-A');
    this.output.push('@ARG', 'M=D');

    // Reposition LCL pointer
    this.output.push('@SP', 'D=M', '@LCL', 'M=D');

    // Transfer control to the called function
    this.writeGoto(functionName);

    // Declare label for return address
    this.writeLabel(`RETURN.${this.functionCounter}`);
  }

  writeReturn() {
    // endFrame = LCL
    this.output.push('@LCL', 'D=M', '@ENDFRAME', 'M=D');

    // retAddr = *(endFrame - 5)
    this.int(5);
    this.output.push('@ENDFRAME', 'D=M-D', 'A=D', 'D=M', '@RETADDR', 'M=D');

    // *ARG = pop()
    this.writePushPop('C_POP', 'argument', 0);

    // SP = ARG + 1
    this.output.push('@ARG', 'D=M', '@SP', 'M=D+1');

    // THAT = *(endFrame - 1)
    this.restorePointer('THAT');
    // THIS = *(endFrame - 2)
    this.restorePointer('THIS');
    // ARG = *(endFrame - 3)
    this.restorePointer('ARG');
    // LCL = *(endFrame - 4)
    this.restorePointer('LCL');

    // goto retAddr
    this.output.push('@RETADDR', 'A=M', '0;JMP');
  }

  // Closes the output file
  close() {
    fs.writeFileSync(
      `${this.dir}/${this.fileName}.asm`,
      this.output.join('\n')
    );
  }
}

module.exports = CodeWriter;
