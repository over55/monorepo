export function isISODate(input) {
  if (input === undefined || input === null || input === "") {
    return false;
  }
  try {
    const date = new Date(input);
    return date.toISOString() === input;
  } catch (e) {
    console.log("isISODate | err:", e);
    return null;
  }
}
