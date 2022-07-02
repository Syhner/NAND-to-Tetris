const Parser = require('./Parser');
const Code = require('./Code');
const { getFiles } = require('./util');

const path = process.argv[2];

const { dir, fileName, filePaths } = getFiles(path);
const parser = new Parser(filePaths);
const code = new Code(dir, fileName);

while (parser.hasMoreCommands()) {
  parser.advance();
  const commandType = parser.commandType();

  if (commandType !== 'BLANK') code.comment(parser.currentCmd);

  switch (commandType) {
    case 'C_PUSH':
    case 'C_POP':
      code.writePushPop(parser.commandType(), parser.arg1, parser.arg2);
      break;

    case 'C_ARITHMETIC':
      code.writeArithmetic(parser.command);
      break;

    case 'C_GOTO':
      code.writeGoto(parser.arg1);
      break;

    case 'C_IF':
      code.writeIf(parser.arg1);
      break;

    case 'C_LABEL':
      code.writeLabel(parser.arg1);
      break;

    case 'C_CALL':
      code.writeCall(parser.arg1, parser.arg2);
      break;

    case 'C_FUNCTION':
      code.writeFunction(parser.arg1, parser.arg2);
      break;

    case 'C_RETURN':
      code.writeReturn();
      break;
  }
}

code.close();
