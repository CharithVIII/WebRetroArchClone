// Default keyboard layout (player 1): WASD = D-pad, arrow keys = left analog stick,
// J/K/U/I = face buttons. The gamepad bindings (value2) are EmulatorJS's own defaults.
// Players can still rebind in the in-game Control Settings; "Reset" returns to this layout.
const k = (value, value2) => (value2 ? { value, value2 } : { value });

export const DEFAULT_CONTROLS = {
  0: {
    0: k('j', 'BUTTON_2'),             // B / Cross
    1: k('u', 'BUTTON_4'),             // Y / Square
    2: k('shift', 'SELECT'),
    3: k('enter', 'START'),
    4: k('w', 'DPAD_UP'),
    5: k('s', 'DPAD_DOWN'),
    6: k('a', 'DPAD_LEFT'),
    7: k('d', 'DPAD_RIGHT'),
    8: k('k', 'BUTTON_1'),             // A / Circle
    9: k('i', 'BUTTON_3'),             // X / Triangle
    10: k('q', 'LEFT_TOP_SHOULDER'),
    11: k('e', 'RIGHT_TOP_SHOULDER'),
    12: k('tab', 'LEFT_BOTTOM_SHOULDER'),
    13: k('r', 'RIGHT_BOTTOM_SHOULDER'),
    14: k('', 'LEFT_STICK'),
    15: k('', 'RIGHT_STICK'),
    16: k('right arrow', 'LEFT_STICK_X:+1'),
    17: k('left arrow', 'LEFT_STICK_X:-1'),
    18: k('down arrow', 'LEFT_STICK_Y:+1'),
    19: k('up arrow', 'LEFT_STICK_Y:-1'),
    20: k('', 'RIGHT_STICK_X:+1'),
    21: k('', 'RIGHT_STICK_X:-1'),
    22: k('', 'RIGHT_STICK_Y:+1'),
    23: k('', 'RIGHT_STICK_Y:-1'),
    24: k('1'),
    25: k('2'),
    26: k('3'),
    27: {},
    28: {},
    29: {},
  },
  1: {},
  2: {},
  3: {},
};
