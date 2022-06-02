// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
//
// This program only needs to handle arguments that satisfy
// R0 >= 0, R1 >= 0, and R0*R1 < 32768.

// n = RAM[0]
@R0
D=M
@n
M=D

// i = 1
@i
M=1

// product = 0
@product
M=0

(LOOP)
  // If i > n, stop looping
  @i
  D=M
  @n
  D=D-M
  @STOP
  D;JGT

  // Calculations
  // product = product + RAM[1]
  @product
  D=M
  @R1
  D=D+M
  @product
  M=D

  // Reloop
  @i
  M=M+1 // i++
  @LOOP
  0;JMP

(STOP)
  // Wrap up calculations
  @product
  D=M
  @R2
  M=D // RAM[2] = product

// Terminate program
(END)
  @END
  0;JMP
