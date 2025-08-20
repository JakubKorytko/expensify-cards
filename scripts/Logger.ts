const DISABLE_LOGGER = false;

const Logger = {
  e: (...args: any[]) => !DISABLE_LOGGER && console.error(...args),
  w: (...args: any[]) => !DISABLE_LOGGER && console.warn(...args),
  m: (...args: any[]) => !DISABLE_LOGGER && console.log(...args),
};

export default Logger;
