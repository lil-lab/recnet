export function isUsernameValid(value) {
  const regex = /^[A-Za-z0-9_]+$/;
  return value.length >= 4 && value.length <= 15 && regex.test(value);
}

export function isYearValid(year) {
  const text = /^[0-9]+$/;
  const current_year = new Date().getFullYear();
  return (
    year.length === 4 && text.test(year) && year > 1600 && year <= current_year
  );
}
