// Program flips the values of RAM[0] and RAM[1]

// D = RAM[0]
@R0
D=M

// Find some available memory register and use it to
// represent the variable temp, now each occurence of
// @temp in the program will be replaced by the
// address of this register
@temp
M=D // temp = D (= RAM[0])

// RAM[0] = RAM[1]
@R1
D=M
@R0
M=D

// RAM[1] = temp
@temp
D=M // D = temp
@R1
M=D

// Terminate program
(END)
  @END
  0;JMP