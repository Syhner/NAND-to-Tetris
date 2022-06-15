const Parser = require('./Parser');
const Code = require('./Code');

const inFileName = process.argv[2];
const parser = new Parser(inFileName);
const code = new Code(inFileName);

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
  }
}

code.close();
