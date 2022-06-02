// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Program draws a filled rectangle at the
// screen's top left corner, with width 16
// pixels and height RAM[0] pixels

// addrlast = SCREEN + 8192 (number of bytes in screen mem map)
@SCREEN
D=A
@8192
D=D+A
@addrlast
M=D

// Reset (or initialise) current address
(RESET)
  // addr = SCREEN
  @SCREEN // Base address of screen mem map
  D=A
  @addr
  M=D

// Keep checking which key is being pressed, then goto BLACK or WHITE
(CHECKKBD)
  // Jump to black fill code if a key is pressed
  // else jump to white fill code
  @KBD
  D=M
  @BLACK
  D;JGT
  @WHITE
  D;JEQ

  // Recheck pressed key
  @CHECKKBD
  0;JMP

// Specify fill color and goto FILL
(BLACK)
  @color
  M=-1
  @FILL
  0;JMP

// Specify fill color and goto FILL
(WHITE)
  @color
  M=0
  @FILL
  0;JMP

// Fill screen mem map with fill color
(FILL)
  // If addr = addrlast, restart program
  @addr
  D=M
  @addrlast
  D=D-M
  @RESET
  D;JEQ

  // RAM[addr] = color
  @color
  D=M
  @addr
  A=M
  M=D

  // Rerun fill loop for next byte
  @addr
  M=M+1 // addr++
  @FILL
  0;JMP