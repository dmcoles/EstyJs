// keyboard emulation routines for EstyJs
// written by Darren Coles
"use strict";

EstyJs.Keyboard = function (opts) {
    var self = {};

    self.active = true;

    self.KeypadJoystick = true;

    var joystickPos = 0; //bit 7 = fire, bit 0 = up, bit 1 = down, bit 2 = left, bit 3 = right

    var clearToSend = true;
    var rxRegisterFull = false;
    var txRegisterEmpty = true;

    var output = opts.control;

    var interrupt = false;

    var mfp = opts.mfp;
    var htmlControl = opts.control;

    var control = 0;

    var mouseMode = 'R';
    //buttons action
    var mouseAction = 0;

    var port0Mouse = true;

    //max x & y for absolute mouse reporting
    var mouseXmax = 0;
    var mouseYmax = 0;

    //trigger values for keycode mouse reporting
    var mouseXkey = 0;
    var mouseYkey = 0;

    //threshold values for keycode mouse reporting
    var mouseXthreshold = 1;
    var mouseYthreshold = 1;

    var invertY = false;

    var paused = false;

    var joystickMode = 'E';

    var keyCommands = new Array();

    var oldMouseX = -10000;
    var oldMouseY = -10000;
    var mouseX = -1;
    var mouseY = -1;

    var leftDown = false;
    var rightDown = false;
    var oldLeftDown = false;
    var oldRightDown = false;

    var absLeftDownSinceLast = false;
    var absLeftUpSinceLast = false;
    var absRightDownSinceLast = false;
    var absRightUpSinceLast = false;

    var resetTime = 0;

    var dataOut = new Array();

    var locked = false;

    var readData = 0;
    var writeData = 0;

    var keyCodes = {
        27: { scancode: 0x01 }, //	Esc
        49: { scancode: 0x02 }, //	1
        50: { scancode: 0x03 }, //	2
        51: { scancode: 0x04 }, //	3
        52: { scancode: 0x05 }, //	4
        53: { scancode: 0x06 }, //	5
        54: { scancode: 0x07 }, //	6
        55: { scancode: 0x08 }, //	7
        56: { scancode: 0x09 }, //	8
        57: { scancode: 0x0A }, //	9
        48: { scancode: 0x0B }, //	0
        173: { scancode: 0x0C }, //	-
        61: { scancode: 0x0D }, //	==
        8: { scancode: 0x0E }, //	BS
        9: { scancode: 0x0F }, //	TAB
        81: { scancode: 0x10 }, //	Q
        87: { scancode: 0x11 }, //	W
        69: { scancode: 0x12 }, //	E
        82: { scancode: 0x13 }, //	R
        84: { scancode: 0x14 }, //	T
        89: { scancode: 0x15 }, //	Y
        85: { scancode: 0x16 }, //	U
        73: { scancode: 0x17 }, //	I
        79: { scancode: 0x18 }, //	O
        80: { scancode: 0x19 }, //	P
        219: { scancode: 0x1A }, //	[
        221: { scancode: 0x1B }, //	]
        13: { scancode: 0x1C }, //	RET
        17: { scancode: 0x1D }, //	CTRL
        65: { scancode: 0x1E }, //	A
        83: { scancode: 0x1F }, //	S
        68: { scancode: 0x20 }, //	D
        70: { scancode: 0x21 }, //	F
        71: { scancode: 0x22 }, //	G
        72: { scancode: 0x23 }, //	H
        74: { scancode: 0x24 }, //	J
        75: { scancode: 0x25 }, //	K
        76: { scancode: 0x26 }, //	L
        59: { scancode: 0x27 }, //	;
        222: { scancode: 0x28 }, //	'
        192: { scancode: 0x29 }, //	`
        16: { scancode: 0x2A }, //	(LEFT) SHIFT
        220: { scancode: 0x2B }, //	\ (backslash)
        90: { scancode: 0x2C }, //	Z
        88: { scancode: 0x2D }, //	X
        67: { scancode: 0x2E }, //	C
        86: { scancode: 0x2F }, //	V
        66: { scancode: 0x30 }, //	B
        78: { scancode: 0x31 }, //	N
        77: { scancode: 0x32 }, //	M
        900: { scancode: 0x33 }, //	,
        190: { scancode: 0x34 }, //	.
        191: { scancode: 0x35 }, //	/
        901: { scancode: 0x36 }, //	(RIGHT) SHIFT
        902: { scancode: 0x37 }, //	{ NOT USED }
        18: { scancode: 0x38 }, //	ALT
        32: { scancode: 0x39 }, //	SPACE BAR
        20: { scancode: 0x3A }, //	CAPS LOCK
        112: { scancode: 0x3B }, //	F1
        113: { scancode: 0x3C }, //	F2
        114: { scancode: 0x3D }, //	F3
        115: { scancode: 0x3E }, //	F4
        116: { scancode: 0x3F }, //	F5
        117: { scancode: 0x40 }, //	F6
        118: { scancode: 0x41 }, //	F7
        119: { scancode: 0x42 }, //	F8
        120: { scancode: 0x43 }, //	F9
        121: { scancode: 0x44 }, //	F10
        903: { scancode: 0x45 }, //	{ NOT USED }
        904: { scancode: 0x46 }, //	{ NOT USED }
        36: { scancode: 0x47 }, //	HOME
        38: { scancode: 0x48 }, //	UP ARROW
        905: { scancode: 0x49 }, //	{ NOT USED }
        109: { scancode: 0x4A }, //	KEYPAD -
        37: { scancode: 0x4B }, //	LEFT ARROW
        906: { scancode: 0x4C }, //	{ NOT USED }
        39: { scancode: 0x4D }, //	RIGHT ARROW
        107: { scancode: 0x4E }, //	KEYPAD +
        907: { scancode: 0x4F }, //	{ NOT USED }
        40: { scancode: 0x50 }, //	DOWN ARROW
        908: { scancode: 0x51 }, //	{ NOT USED }
        45: { scancode: 0x52 }, //	INSERT
        46: { scancode: 0x53 }, //	DEL
        909: { scancode: 0x54 }, //	{ NOT USED }
        910: { scancode: 0x5F }, //	{ NOT USED }
        123: { scancode: 0x60 }, //	ISO KEY
        33: { scancode: 0x61 }, //	UNDO
        34: { scancode: 0x62 }, //	HELP
        911: { scancode: 0x63 }, //	KEYPAD (
        912: { scancode: 0x64 }, //	KEYPAD )
        106: { scancode: 0x65 }, //	KEYPAD /
        108: { scancode: 0x66 }, //	KEYPAD *
        103: { scancode: 0x67 }, //	KEYPAD 7
        104: { scancode: 0x68 }, //	KEYPAD 8
        105: { scancode: 0x69 }, //	KEYPAD 9
        100: { scancode: 0x6A }, //	KEYPAD 4
        101: { scancode: 0x6B }, //	KEYPAD 5
        102: { scancode: 0x6C }, //	KEYPAD 6
        97: { scancode: 0x6D }, //	KEYPAD 1
        98: { scancode: 0x6E }, //	KEYPAD 2
        99: { scancode: 0x6F }, //	KEYPAD 3
        96: { scancode: 0x70 }, //	KEYPAD 0
        110: { scancode: 0x71 }, //	KEYPAD .
        913: { scancode: 0x72} //	KEYPAD ENTER
    };

    function toBCD(v) {
        return (Math.floor(v / 10) << 4) + (v % 10);
    }

    function lockChange() {
        var requestedElement = document.getElementById(output);


        if (document.pointerLockElement === requestedElement ||
          document.mozPointerLockElement === requestedElement ||
          document.webkitPointerLockElement === requestedElement) {
            // Pointer was just locked
            // Enable the mousemove listener
            document.onmousemove = mouseMove2;
            locked = true;
        } else {
            // Pointer was just unlocked
            // Disable the mousemove listener
            document.onmousemove = mouseMove;
            locked = false;
        }
    }

    function mouseMove(evt) {
        mouseX = evt.pageX - $("#" + output).offset().left;
        mouseY = evt.pageY - $("#" + output).offset().top;
        if (oldMouseX == -10000) {
            oldMouseX = mouseX;
            oldMouseY = mouseY;
        }
    }

    function mouseMove2(e) {
        var movementX = e.movementX ||
              e.mozMovementX ||
              e.webkitMovementX ||
              0,
          movementY = e.movementY ||
              e.mozMovementY ||
              e.webkitMovementY ||
              0;

        mouseX = mouseX + movementX;
        mouseY = mouseY + movementY;

        if (oldMouseX == -10000) {
            oldMouseX = mouseX;
            oldMouseY = mouseY;
        }
    }

    function mouseDown(evt) {
        switch (evt.button) {
            case 0:
                evt.stopPropagation();
                leftDown = true;
                absLeftDownSinceLast = true;
                break;
            case 2:
                evt.stopPropagation();
                rightDown = true;
                absRightDownSinceLast = true;
                break;
        }
        evt.preventDefault();
        return true;

    }

    function mouseUp(evt) {
        switch (evt.button) {
            case 0:
                evt.stopPropagation();

                leftDown = false;
                absLeftUpSinceLast = true;
                break;
            case 2:
                evt.stopPropagation();
                rightDown = false;
                absRightUpSinceLast = true;
                break;
        }
        evt.preventDefault();
        return true;
    }

    function keyDown(evt) {
        if (self.active) {
            registerKeyDown(evt.keyCode);
            if (!evt.metaKey) return false;
        }
    }
    function registerKeyDown(keyNum) {
        var keyCode = keyCodes[keyNum];
        if (keyCode == null) return;

        if (resetTime > 0) return;

        keyCode = keyCode.scancode;

        //75 = left cursor, 77 = right cursor, 80 = down, 72 = up
        if (self.KeypadJoystick && (keyCode == 75 || keyCode == 77 || keyCode == 72 || keyCode == 80) || keyCode == 0x1D) {
            switch (keyCode) {
                //bit 0 = left, bit 1 = right, bit 2 = up, bit 3 = down, bit 7 = fire                                   
                case 72:
                    //up
                    joystickPos |= 1;
                    break;
                case 80:
                    //down
                    joystickPos |= 2;
                    break;
                case 75:
                    //left
                    joystickPos |= 4;
                    break;
                case 77:
                    //right
                    joystickPos |= 8;
                    break;
                case 0x1d:
                    //fire
                    joystickPos |= 128;
                    break;

            }

            //if port0mouse joystick sends right mouse click instead of fire
            if ((keyCode == 0x1d) && port0Mouse) {
                if (mouseAction == 4 || mouseMode == 'K') {
                    dataOut.push(0x75);
                } else if (mouseMode == 'R') {
                    dataOut.push(0xf9 | (leftDown ? 2 : 0)); //mouse buttons
                    dataOut.push(0);
                    dataOut.push(0);
                }
            }

            if (joystickMode == 'E' && (keyCode != 0x1d | !port0Mouse)) {
                //fe = joystick 0, ff = joystick 1
                dataOut.push(0xff);
                dataOut.push(joystickPos)
            }

        } else {
            dataOut.push(keyCode)
        }
    }
    function keyUp(evt) {
        registerKeyUp(evt.keyCode);
        if (self.active && !evt.metaKey) return false;
    }
    function registerKeyUp(keyNum) {
        var keyCode = keyCodes[keyNum];
        if (keyCode == null) return;

        if (resetTime > 0) return;

        keyCode = keyCode.scancode;

        if (self.KeypadJoystick && (keyCode == 75 || keyCode == 77 || keyCode == 72 || keyCode == 80) || keyCode == 0x1D) {
            switch (keyCode) {
                //bit 0 = left, bit 1 = right, bit 2 = up, bit 3 = down, bit 7 = fire                                   
                case 72:
                    //up
                    joystickPos &= 0xff - 1;
                    break;
                case 80:
                    //down
                    joystickPos &= 0xff - 2;
                    break;
                case 75:
                    //left
                    joystickPos &= 0xff - 4;
                    break;
                case 77:
                    //right
                    joystickPos &= 0xff - 8;
                    break;
                case 0x1d:
                    //fire
                    joystickPos &= 0xff - 128;
                    break;

            }

            //if port0mouse joystick sends right mouse click instead of fire
            if ((keyCode == 0x1d) && port0Mouse) {
                if (mouseAction == 4 || mouseMode == 'K') {
                    dataOut.push(0xf5);
                } else if (mouseMode == 'R') {
                    dataOut.push(0xf8 | (leftDown ? 2 : 0)); //mouse buttons
                    dataOut.push(0);
                    dataOut.push(0);
                }
            }

            if (joystickMode == 'E' && (keyCode != 0x1d | !port0Mouse)) {
                //fe = joystick 0, ff = joystick 1
                dataOut.push(0xff);
                dataOut.push(joystickPos)
            }

        } else {
            dataOut.push(0x80 | keyCode)
        }
    }

    function keyPress(evt) {
        if (self.active && !evt.metaKey) return false;
    }

    self.checkJoystick = function () {
        var newJoystickPos = 0;

        var gamepad = null;
        if (navigator.getGamepads && navigator.getGamepads().length > 0) gamepad = navigator.getGamepads()[0];

        if (gamepad != null) {
            //up
            if (gamepad.buttons.length > 12 && gamepad.buttons[12].pressed) newJoystickPos |= 1;
            //down
            if (gamepad.buttons.length > 13 && gamepad.buttons[13].pressed) newJoystickPos |= 2;
            //left
            if (gamepad.buttons.length > 14 && gamepad.buttons[14].pressed) newJoystickPos |= 4;
            //right
            if (gamepad.buttons.length > 15 && gamepad.buttons[15].pressed) newJoystickPos |= 8;

            //up
            if (gamepad.axes.length > 0 && gamepad.axes[1] < -0.5) newJoystickPos |= 1;
            //down
            if (gamepad.axes.length > 0 && gamepad.axes[1] > 0.5) newJoystickPos |= 2;
            //left
            if (gamepad.axes.length > 1 && gamepad.axes[0] < -0.5) newJoystickPos |= 4;
            //right
            if (gamepad.axes.length > 1 && gamepad.axes[0] > 0.5) newJoystickPos |= 8;

            //any other fire buttons
            for (var i = 0; i < 12; i++) {
                if (gamepad.buttons.length > i && gamepad.buttons[i].pressed) newJoystickPos |= 128;
            }

            if (newJoystickPos != joystickPos) {
                joystickPos = newJoystickPos
                if (joystickMode == 'E' && !port0Mouse) {
                    //fe = joystick 0, ff = joystick 1
                    dataOut.push(0xff);
                    dataOut.push(joystickPos)
                }
            }
        }

        
    }

    self.readkeys = function () {
    }

    self.setControl = function (val) {
        control = val;
        if ((control & 0x3) == 3) {
            //reset
            interrupt = false;
            rxRegisterFull = false;
            txRegisterEmpty = true;
            dataOut.length = 0;
            mfp.setAciaGpio();

        }
    }

    self.readControl = function () {
        return (
		  (interrupt ? 0x80 : 0) |    // interrupt
		  (rxRegisterFull ? 1 : 0) | //receive byte ready	
		  (txRegisterEmpty ? 2 : 0) | //transmit data buffer empty
		  (clearToSend ? 8 : 0)); //ok to send
    }

    self.readData = function () {
        interrupt = false;
        mfp.setAciaGpio();
        rxRegisterFull = false;
        return readData;
    }

    self.processCommand = function (cmd) {
        txRegisterEmpty = false;
        writeData = cmd;
    }
    ;
    self.processRow = function (processor) {
        if (resetTime > 0) {
            resetTime--;
            if (!resetTime) {
                //self check completed ok.
                dataOut.push(0xF0);
            }


        }

        if (!txRegisterEmpty) {
            keyCommands.push(writeData);
            txRegisterEmpty = true;
        }

        if (dataOut.length > 0 && !rxRegisterFull && !paused) {
            readData = (dataOut.shift()) & 0xff;
            rxRegisterFull = true; //set receive data register full
        }

        //trigger interrupt
        if ((control & 0x80) && (rxRegisterFull)) {
            interrupt = true;
            mfp.clearAciaGpio();
            mfp.interruptRequest(6);
        }


        if (mouseAction == 4) {
            if (leftDown & !oldLeftDown) dataOut.push(0x74);
            if (!leftDown & oldLeftDown) dataOut.push(0xf4);
            if (rightDown & !oldRightDown) dataOut.push(0x75);
            if (!rightDown & oldRightDown) dataOut.push(0xf5);
        }


        if (joystickMode == 'E' && (leftDown != oldLeftDown) && !port0Mouse) {
            //fe = joystick 0, ff = joystick 1
            dataOut.push(0xfe);
            dataOut.push(leftDown ? 128 : 0)
        }

        if (mouseMode == 'R' && !resetTime && port0Mouse) {
            var xd = (mouseX - oldMouseX) >> 1;
            var yd = (mouseY - oldMouseY) >> 1;

            if ((Math.abs(xd) > mouseXthreshold) || (Math.abs(yd) > mouseYthreshold) || oldLeftDown != leftDown || oldRightDown != rightDown) {
                dataOut.push(0xf8 | (leftDown ? 2 : 0) | (rightDown ? 1 : 0)); //mouse buttons
                dataOut.push(xd);
                if (invertY) {
                    dataOut.push(-yd);
                } else {
                    dataOut.push(yd);
                }

                oldMouseX = mouseX;
                oldMouseY = mouseY;
            }
        }

        /*if (mouseMode == 'A' && !resetTime) {
        var xd = (mouseX - oldMouseX) >> 1;
        var yd = (mouseY - oldMouseY) >> 1;

        if ((Math.abs(xd) > mouseXthreshold) || (Math.abs(yd) > mouseYthreshold) || oldLeftDown != leftDown || oldRightDown != rightDown) {
        dataOut.push(0xf8 | (leftDown ? 2 : 0) | (rightDown ? 1 : 0)); //mouse buttons
        dataOut.push(xd);
        if (invertY) {
        dataOut.push(-yd);
        } else {
        dataOut.push(yd);
        }

        oldMouseX = mouseX;
        oldMouseY = mouseY;
        oldLeftDown = leftDown;
        oldRightDown = rightDown;
        }
        }*/

        if (keyCommands.length > 0) {

            var keyCmd = keyCommands[0];

            var paramCount;

            switch (keyCmd) {
                case 0x07:
                case 0x80:
                    paramCount = 1;
                    break;
                case 0x09:
                    paramCount = 4;
                    break;
                case 0x0A:
                case 0x0B:
                case 0x0C:
                case 0x21:
                case 0x22:
                    paramCount = 2;
                    break;
                case 0x0E:
                    paramCount = 5;
                    break;
                case 0x19:
                case 0x1B:
                    paramCount = 6;
                    break;
                case 0x20:
                    //memory load variable length
                    if (keyCommands.length < 3) return;
                    paramCount = 2 + keyCommands[3];
                default:
                    paramCount = 0;
            }

            if (keyCommands.length < paramCount + 1) return;
            keyCommands.shift();

            paused = false;

            switch (keyCmd) {
                case 0x80:
                    //keyboard reset
                    var keyCmd2 = keyCommands.shift();

                    if (keyCmd2 != 1) return;
                    joystickMode = 'E';
                    joystickPos = 0;
                    mouseAction = 0;
                    mouseMode = 'R';
                    port0Mouse = true;

                    resetTime = 400;
                    break;

                case 0x07:
                    //mouse button action
                    port0Mouse = true;
                    mouseAction = keyCommands.shift();
                    break;
                case 0x08:
                    //relative mouse position reporting
                    port0Mouse = true;
                    mouseMode = 'R';
                    break;
                case 0x09:
                    //absolute mouse position reporting
                    mouseMode = 'A';
                    port0Mouse = true;
                    mouseXmax = (keyCommands.shift() << 8) + keyCommands.shift();
                    mouseYmax = (keyCommands.shift() << 8) + keyCommands.shift();
                    break;
                case 0x0A:
                    //keycode mouse poisition reporting
                    mouseMode = 'K';
                    port0Mouse = true;
                    mouseXkey = keyCommands.shift();
                    mouseYkey = keyCommands.shift();
                    break;
                case 0x0B:
                    //set threshold
                    port0Mouse = true;
                    mouseXthreshold = keyCommands.shift();
                    mouseYthreshold = keyCommands.shift();
                    break;
                case 0x0C:
                    //set scale
                    port0Mouse = true;
                    mouseXscale = keyCommands.shift();
                    mouseYscale = keyCommands.shift();
                    break;
                case 0x0D:
                    //interrogate mouse position
                    port0Mouse = true;

                    if (dataOut.length > 255) break;

                    dataOut.push(0xf7);
                    dataOut.push(0 | (absLeftUpSinceLast ? 8 : 0) | (absLeftDownSinceLast ? 4 : 0) | (absRightUpSinceLast ? 2 : 0) | (absRightDownSinceLast ? 1 : 0));
                    dataOut.push(Math.floor((mouseX / $("#" + output).width() * mouseXmax) >> 8));
                    dataOut.push(Math.floor((mouseX / $("#" + output).width() * mouseXmax) & 0xff));
                    dataOut.push(Math.floor((mouseY / $("#" + output).height() * mouseYmax) >> 8));
                    dataOut.push(Math.floor((mouseY / $("#" + output).height() * mouseYmax) & 0xff));
                    absLeftDownSinceLast = false;
                    absLeftUpSinceLast = false;
                    absRightDownSinceLast = false;
                    absRightUpSinceLast = false;

                    break;
                case 0x0E:
                    //set mouse position
                    //not yet implemented
                    port0Mouse = true;
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    break;
                case 0x0F:
                    //set y at bottom
                    port0Mouse = true;
                    invertY = true;
                    break;
                case 0x10:
                    //set y at top
                    port0Mouse = true;
                    invertY = false;
                    break;
                case 0x11:
                    //resume
                    // do nothing - any command unpauses
                    break;
                case 0x12:
                    //disable mouse
                    port0Mouse = false;
                    mouseMode = '';
                    break;
                case 0x13:
                    //pause
                    paused = true;
                    break;
                case 0x14:
                    //set joystick event reporting
                    port0Mouse = false;
                    joystickMode = 'E';
                    break;
                case 0x15:
                    //disable joystick event reporting
                    joystickMode = '';
                    break;
                case 0x16:
                    //interrogate joystick
                    port0Mouse = false;
                    if (dataOut.length > 255) break;

                    dataOut.push(0xfd);
                    dataOut.push(0);
                    dataOut.push(joystickPos);
                    break;
                case 0x17:
                    //set joystick monitoring
                    //not yet implemented
                    port0Mouse = false;
                    break;
                case 0x18:
                    //set fire button monitoring
                    //not yet implemented
                    port0Mouse = false;
                    break;
                case 0x19:
                    //set joystick keycode mode
                    port0Mouse = false;
                    joystickMode = 'K';
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    break;
                case 0x1A:
                    //disable joystick
                    joystickMode = '';
                    break;
                case 0x1B:
                    //time of day clock set
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    keyCommands.shift();
                    break;
                case 0x1C:
                    //query time of day clock
                    var currDate = new Date();
                    dataOut.push(0xfc);
                    dataOut.push(toBCD(currDate.getFullYear() % 100));
                    dataOut.push(toBCD(currDate.getMonth() + 1));
                    dataOut.push(toBCD(currDate.getDate()));
                    dataOut.push(toBCD(currDate.getHours()));
                    dataOut.push(toBCD(currDate.getMinutes()));
                    dataOut.push(toBCD(currDate.getSeconds()));
                    break;

                case 0x20:
                    //memory load
                    //not implemented
                    break;
                case 0x21:
                    //memory read
                    //not implemented
                    break;
                case 0x22:
                    //controller execute
                    //not implemented
                    break;

                case 0x87:
                    //mouse button action status inquiry
                    if (dataOut.length > 255) break;

                    dataOut.push(0xf6);
                    dataOut.push(mouseAction);
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);

                    break;

                case 0x88:
                case 0x89:
                case 0x8A:
                    //mouse mode status inquiry
                    //mode        ; 0x08 is RELATIVE
                    //   ; 0x09 is ABSOLUTE
                    //   ; 0x0A is KEYCODE
                    switch (mouseMode) {
                        case 'R':
                            dataOut.push(0xf6);
                            dataOut.push(0x8);
                            break;
                        case 'A':
                            dataOut.push(0xf6);
                            dataOut.push(0x9);
                            break;
                        case 'K':
                            dataOut.push(0xf6);
                            dataOut.push(0xA);
                            break;
                    }
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);
                    break;

                case 0x8B:
                    //mouse threshold inquiry
                    dataOut.push(0xf6);
                    dataOut.push(mouseXthreshold);
                    dataOut.push(mouseYthreshold);
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);
                    break;

                case 0x8C:
                    //mouse scale inquiry
                    dataOut.push(0xf6);
                    dataOut.push(mouseXscale);
                    dataOut.push(mouseYscale);
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);
                    break;

                case 0x8F:
                case 0x90:
                    //mouse invery inquiry
                    dataOut.push(0xf6);
                    if (invertY) {
                        dataOut.push(0x10);
                    } else {
                        dataOut.push(0xF);
                    }
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);
                    break;
                case 0x92:
                    //mouse enable inquiry
                    dataOut.push(0xf6);
                    if (mouseMode == '') {
                        dataOut.push(0x12);
                    } else {
                        dataOut.push(0);
                    }
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);
                    break;
                case 0x94:
                case 0x95:
                case 0x96:
                    //joystick mode inquiry
                    dataOut.push(0xf6);

                    //joystick mode to be implemented
                    dataOut.push(0);

                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);

                case 0x9A:
                    //joystick mode inquiry
                    dataOut.push(0xf6);
                    if (joystickMode == '') {
                        dataOut.push(0x1A);
                    } else {
                        dataOut.push(0);
                    }
                    dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0); dataOut.push(0);

                    break;
            }

        }

        oldLeftDown = leftDown;
        oldRightDown = rightDown;
    }

    var htmlElement = document.getElementById(htmlControl);
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    document.onkeypress = keyPress;
    document.onmousemove = mouseMove;
    htmlElement.onmousedown = mouseDown;
    htmlElement.onmouseup = mouseUp;
    htmlElement.oncontextmenu = function () {
        return false;
    }

    self.setSnapshotRegs = function (regs) {
        mouseMode = regs.mouseMode;
        joystickMode = regs.joystickMode;
    }

    self.lockMouse = function () {
        var havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;

        if (havePointerLock) {

            // Hook pointer lock state change events
            document.addEventListener('pointerlockchange', lockChange, false);
            document.addEventListener('mozpointerlockchange', lockChange, false);
            document.addEventListener('webkitpointerlockchange', lockChange, false);

            htmlElement = document.getElementById(output);

            htmlElement.requestPointerLock = htmlElement.requestPointerLock ||
                                htmlElement.mozRequestPointerLock ||
                                htmlElement.webkitRequestPointerLock;

            if (!locked) {

                // Ask the browser to lock the pointer
                htmlElement.requestPointerLock();
            } else {
                htmlElement.exitPointerLock();
            }

            // Hook pointer lock state change events

            /*document.addEventListener('pointerlockchange', changeCallback, false);
            document.addEventListener('mozpointerlockchange', changeCallback, false);
            document.addEventListener('webkitpointerlockchange', changeCallback, false);*/
        }
    }

    self.mouseLocked = function () {
        return locked;
    }


    return self;
}

