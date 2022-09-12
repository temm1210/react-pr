const convertHexToRGBA = (hexCode: string, opacity = 1) => {
  let hex = hexCode.replace("#", "");

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  let a = opacity;

  /* Backward compatibility for whole number based opacity values. */
  if (a > 1 && a <= 100) {
    a /= 100;
  }

  return `rgba(${r},${g},${b},${a})`;
};

export default convertHexToRGBA;
