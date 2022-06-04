const VIRTUAL_REGISTERS = 16;

class SymbolTable {
  constructor() {
    // Add predefined symbols
    this.table = {
      SP: 0,
      LCL: 1,
      ARG: 2,
      THIS: 3,
      THAT: 4,
      SCREEN: 16384,
      KBD: 24576,
    };

    // Add virtual registers
    for (let i = 0; i < VIRTUAL_REGISTERS; i++) {
      this.table[`R${i}`] = i;
    }

    this.availableAddress = 16;
  }

  getAddress(symbol) {
    // Symbol is a var not in table, so add to table
    if (this.table[symbol] === undefined) {
      this.table[symbol] = this.availableAddress++;
    }

    return this.table[symbol];
  }

  addSymbol(symbol, address) {
    this.table[symbol] = address;
  }
}

module.exports = new SymbolTable();
