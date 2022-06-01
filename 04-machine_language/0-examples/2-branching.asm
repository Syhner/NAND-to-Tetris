// if RAM[0] == 0 (condition)
//    RAM[1] = 0 (if block)
// else
//    RAM[2] = 0 (else block)

// Condition
@R0 // M = RAM[0]
D=M // D = RAM[0]
@IF // computes to line number of (IF)
D;JEQ // if D == 0, jump to (IF) line number

// Else block
@R2
M=0
@END
0;JMP

// If block
(IF)
  @R1
  M=0

// Terminate program
(END)
  @END
  0;JMP