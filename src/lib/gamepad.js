export const STANDARD_BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LEFT_SHOULDER: 4,
  RIGHT_SHOULDER: 5,
  LEFT_TRIGGER: 6,
  RIGHT_TRIGGER: 7,
  SELECT: 8,
  START: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  GUIDE: 16,
};

export const STANDARD_AXES = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
};

export default class GamepadManager {
  #callbacks = { button: {}, axis: {} };

  #previousButtonStates = {};

  #previousAxisValues = {};

  #polling = false;

  #animationFrameId = null;

  start () {
    window.addEventListener('gamepadconnected', this.#onConnected);
    window.addEventListener('gamepaddisconnected', this.#onDisconnected);

    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      this.#startPolling();
    }
  }

  stop () {
    window.removeEventListener('gamepadconnected', this.#onConnected);
    window.removeEventListener('gamepaddisconnected', this.#onDisconnected);
    this.#stopPolling();
  }

  onButtonPress (button, callback) {
    const index = typeof button === 'string' ? STANDARD_BUTTONS[button] : button;
    if (index === undefined) return;
    if (!this.#callbacks.button[index]) {
      this.#callbacks.button[index] = {};
      this.#previousButtonStates[index] = false;
    }
    this.#callbacks.button[index].onPress = callback;
  }

  onButtonRelease (button, callback) {
    const index = typeof button === 'string' ? STANDARD_BUTTONS[button] : button;
    if (index === undefined) return;
    if (!this.#callbacks.button[index]) {
      this.#callbacks.button[index] = {};
      this.#previousButtonStates[index] = false;
    }
    this.#callbacks.button[index].onRelease = callback;
  }

  onAxisChange (axis, callback) {
    const index = typeof axis === 'string' ? STANDARD_AXES[axis] : axis;
    if (index === undefined) return;
    this.#callbacks.axis[index] = { onChange: callback };
    this.#previousAxisValues[index] = 0;
  }

  #startPolling () {
    if (this.#polling) return;
    this.#polling = true;
    this.#poll();
  }

  #stopPolling () {
    this.#polling = false;
    if (this.#animationFrameId) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }

  #onConnected = () => {
    if (!this.#polling) {
      this.#startPolling();
    }
  };

  #onDisconnected = () => {
    const gamepads = navigator.getGamepads();
    if (!gamepads[0]) {
      this.#stopPolling();
    }
  };

  #poll = () => {
    if (!this.#polling) return;
    this.#animationFrameId = requestAnimationFrame(this.#poll);

    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (!gp) return;

    for (const indexStr in this.#callbacks.button) {
      const index = Number(indexStr);
      const cb = this.#callbacks.button[index];
      const pressed = gp.buttons[index]?.pressed ?? false;
      const prevPressed = this.#previousButtonStates[index];

      if (pressed && !prevPressed && cb.onPress) {
        cb.onPress();
      }
      if (!pressed && prevPressed && cb.onRelease) {
        cb.onRelease();
      }
      this.#previousButtonStates[index] = pressed;
    }

    for (const indexStr in this.#callbacks.axis) {
      const index = Number(indexStr);
      const cb = this.#callbacks.axis[index];
      const value = gp.axes[index] ?? 0;
      const prevValue = this.#previousAxisValues[index];

      if (value !== prevValue && cb.onChange) {
        cb.onChange(value, prevValue);
      }
      this.#previousAxisValues[index] = value;
    }
  };
}
