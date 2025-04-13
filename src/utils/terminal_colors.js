/**
 * Terminal Colors Module
 * Provides ANSI color codes and styling for terminal output
 * @module terminalColors
 */

// Define color codes using ANSI escape sequences.
const colorCodes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  inverse: "\x1b[7m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  grey: "\x1b[90m", // Alias for gray

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m",
  bgGrey: "\x1b[100m", // Alias for bgGray

  // Bright colors
  blackBright: "\x1b[90m",
  redBright: "\x1b[91m",
  greenBright: "\x1b[92m",
  yellowBright: "\x1b[93m",
  blueBright: "\x1b[94m",
  magentaBright: "\x1b[95m",
  cyanBright: "\x1b[96m",
  whiteBright: "\x1b[97m",

  bgBlackBright: "\x1b[100m",
  bgRedBright: "\x1b[101m",
  bgGreenBright: "\x1b[102m",
  bgYellowBright: "\x1b[103m",
  bgBlueBright: "\x1b[104m",
  bgMagentaBright: "\x1b[105m",
  bgCyanBright: "\x1b[106m",
  bgWhiteBright: "\x1b[107m",
};

/**
 * Parses an RGB color string or array and returns the ANSI escape code.
 * @param {string|number[]} color - The RGB color as a string ('rgb(255, 0, 0)') or an array [255, 0, 0].
 * @returns {string} The ANSI escape code for the RGB color, or an empty string if parsing fails.
 */
function parseRgb(color) {
  if (typeof color === "string") {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return `\x1b[38;2;${r};${g};${b}m`;
      }
    }
  } else if (Array.isArray(color) && color.length === 3) {
    const r = color[0];
    const g = color[1];
    const b = color[2];
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return `\x1b[38;2;${r};${g};${b}m`;
    }
  }
  return "";
}

/**
 * Parses a hex color string and returns the ANSI escape code.
 * @param {string} hex - The hex color string (e.g., '#ff0000').
 * @returns {string} The ANSI escape code for the hex color, or an empty string if parsing fails.
 */
function parseHex(hex) {
  const match = hex.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (match) {
    let hexValue = match[1];
    if (hexValue.length === 3) {
      hexValue =
        hexValue[0] +
        hexValue[0] +
        hexValue[1] +
        hexValue[1] +
        hexValue[2] +
        hexValue[2];
    }
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
  }
  return "";
}

/**
 * Creates a colored string for terminal output.  This is the core function.
 * @param {string} str - The string to be colored.
 * @param {string[]} styles - An array of style names (e.g., ['red', 'bold']).
 * @returns {string} The string with ANSI color codes applied.
 */
function colorString(str, styles) {
  let coloredString = "";
  for (const style of styles) {
    const colorCode = colorCodes[style];
    if (colorCode) {
      coloredString += colorCode;
    } else if (style.startsWith("rgb(")) {
      coloredString += parseRgb(style);
    } else if (style.startsWith("#")) {
      coloredString += parseHex(style);
    } else {
      console.warn(`Style "${style}" not supported.`);
    }
  }
  coloredString += str + colorCodes.reset;
  return coloredString;
}

/**
 * Main function to create a chainable object for styling text.
 * @param {string} text - The text to style.
 * @returns {object} - A chainable object with color and style methods.
 */
function colored(text = "") {
  const styles = [];
  const chainable = {
    text,
    styles, // Keep track of styles
    /**
     * Applies colors and styles to the text.
     * @returns {string} The styled text.
     */
    toString: () => {
      return colorString(chainable.text, styles);
    },
    valueOf: () => {
      return colorString(chainable.text, styles);
    },
    /**
     * Concatenates the current styled text with another string or styled object.
     * @param {...*} args - Strings or other colored objects to concatenate.
     * @returns {object} - Returns the chainable object with concatenated text.
     */
    concat: (...args) => {
      let resultText = chainable.text;
      for (const arg of args) {
        if (typeof arg === "string") {
          resultText += arg;
        } else if (
          typeof arg === "object" &&
          arg &&
          typeof arg.toString === "function"
        ) {
          resultText += arg.toString();
        } else {
          resultText += String(arg);
        }
      }
      chainable.text = resultText;
      return chainable;
    },
  };

  // Dynamically create color and style methods.
  for (const colorName in colorCodes) {
    if (colorCodes.hasOwnProperty(colorName)) {
      chainable[colorName] = function () {
        if (!colorCodes[colorName]) {
          console.warn(`Color "${colorName}" is not supported`);
          return this;
        }
        styles.push(colorName);
        return this;
      };
    }
  }

  // Add rgb and hex
  /**
   * Apply RGB color
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {object} Chainable object
   */
  chainable.rgb = function (r, g, b) {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      console.warn('RGB values must be between 0-255');
      return this;
    }
    styles.push(`rgb(${r},${g},${b})`);
    return this;
  };

  /**
   * Apply HEX color
   * @param {string} hex - Hex color string (e.g. #ff0000)
   * @returns {object} Chainable object
   */
  chainable.hex = function (hex) {
    if (!/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
      console.warn('Invalid HEX color format');
      return this;
    }
    styles.push(hex);
    return this;
  };

  return chainable;
}

module.exports = colored;

