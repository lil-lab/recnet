export function isUsernameValid(value) {
  const regex = /^[A-Za-z0-9_]+$/;
  return value.length >= 4 && value.length <= 15 && regex.test(value);
}
