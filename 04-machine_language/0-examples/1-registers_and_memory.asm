@100 // A = 100, M = RAM[100]

// D = 10
@10
D=A

// D++
D=D+1

// D = RAM[17]
@17
D=M

// RAM[17] = D
@17
M=D

// RAM[17] = 10
@10
D=A
@17
M=D

// RAM[17] = RAM[18]
@18
D=M
@7
M=D

// RAM[2] = RAM[0] + RAM[1]
@0
D=M // D = RAM[0]
@1
D=D+M // D = D + RAM[1]
@2
M=D // RAM[2] = D

// RAM[3] = 10 without virtual registers (cryptic code)
@10
D=A
@3
M=D

// RAM[3] = 10 with virtual registers (first 16 registers)
@10
D=A
@R3
M=D

// Terminate program
(END)
  @END
  0;JMP