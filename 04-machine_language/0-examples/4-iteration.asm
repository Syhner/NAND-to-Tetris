// Computes RAM[1] = 1 + 2 + ... + RAM[0]

// n = RAM[0]
@R0
D=M
@n
M=D

// i = 1
@i
M=1

// sum = 0
@sum
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
  @sum
  D=M
  @i
  D=D+M
  @sum
  M=D // sum = sum + i

  // Reloop
  @i
  M=M+1 // i++
  @LOOP
  0;JMP

(STOP)
  // Wrap up calculations
  @sum
  D=M
  @R1
  M=D // RAM[1] = sum

// Terminate program
(END)
  @END
  0;JMP
