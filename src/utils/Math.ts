export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export const degreesToRadians = (degrees: number) => {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

export const radiansToDegrees = (radians: number) => {
  var pi = Math.PI;
  return radians * (180/pi);
}

export const toFixed = (value: number, decimals: number) => {
  var decimals = decimals || 0,
    power = Math.pow(10, decimals),
    absValue = Math.abs(Math.round(value * power)),
    result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));

  if (decimals > 0) {
    var fraction = String(absValue % power),
      padding = new Array(Math.max(decimals - fraction.length, 0) + 1).join('0');
    result += '.' + padding + fraction;
  }
  return Number(result);
}