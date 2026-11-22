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

// ---- user-editable bindings (edited from the Controls panel in the library) ----
export const ACTIONS = [
  { group: 'D-pad', items: [[4, 'Up'], [5, 'Down'], [6, 'Left'], [7, 'Right']] },
  { group: 'Buttons', items: [[8, 'A / Circle'], [0, 'B / Cross'], [9, 'X / Triangle'], [1, 'Y / Square']] },
  { group: 'Shoulders', items: [[10, 'L'], [11, 'R'], [12, 'L2'], [13, 'R2']] },
  { group: 'System', items: [[2, 'Select'], [3, 'Start']] },
  { group: 'Analog stick (PSP)', items: [[19, 'Stick up'], [18, 'Stick down'], [17, 'Stick left'], [16, 'Stick right']] },
];

const LS_KEY = 'ha-controls';

export function loadUserControls() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY));
    if (v && typeof v.keys === 'object') return { keys: v.keys, stamp: v.stamp || 0 };
  } catch { /* ignore */ }
  return { keys: {}, stamp: 0 };
}

export function saveUserControls(keys) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ keys, stamp: Date.now() })); } catch { /* ignore */ }
}

/** Current key name for an action: the user's override, else the default. */
export const keyFor = (idx, keys = loadUserControls().keys) => keys[idx] ?? DEFAULT_CONTROLS[0][idx].value;

/** Full EmulatorJS controller map with the user's overrides applied. */
export function buildControls(keys = loadUserControls().keys) {
  const out = JSON.parse(JSON.stringify(DEFAULT_CONTROLS));
  for (const [idx, key] of Object.entries(keys)) if (out[0][idx]) out[0][idx].value = key;
  return out;
}
