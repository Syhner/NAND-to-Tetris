// Program draws a filled rectangle at the
// screen's top left corner, with width 16
// pixels and height RAM[0] pixels

// addr = 16384
@SCREEN // Base address of screen mem map
D=A
@addr
M=D

// n = RAM[0]
@R0
D=M
@n
M=D

// i = 0
@i
M=0

(LOOP)
  // If i > n, stop looping
  @i
  D=M
  @n
  D=D-M
  @END
  D;JGT

  // RAM[addr] = 1111111111111111
  @addr
  A=M
  M=-1

  // addr = addr + 32
  @32
  D=A
  @addr
  M=D+M

  // Reloop
  @i
  M=M+1 // i++
  @LOOP
  0;JMP

// Terminate program
(END)
  @END
  0;JMP