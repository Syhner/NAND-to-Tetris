// Program fills RAM[100] to RAM[109] with -1

// for (i = 0; i < n; i++) {
//     arr[i] = -1
// }

// Here arr=100, n = 10

// arr = 100
@100
D=A
@arr
M=D

// n = 10
@10
D=A
@n
M=D

// i = 0
@i
M=0

(LOOP)
  // If i == n, stop looping
  @i
  D=M
  @n
  D=D-M
  @END
  D;JEQ

  // RAM[arr+i] = -1
  @arr
  D=M
  @i
  A=D+M // Now M=RAM[D+M]
  M=-1

  // Reloop
  @i
  M=M+1 // i++
  @LOOP
  0;JMP

(END)
  @END
  0;JMP