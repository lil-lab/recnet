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

export function isTitleValid(title) {
  const lowerCaseWords = new Set(["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "in", "of", "with"]);

  const words = title.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (words[i] === '') continue;

    if (i === 0 || !lowerCaseWords.has(words[i].toLowerCase())) {
      if (!words[i][0] || words[i][0] !== words[i][0].toUpperCase()) {
        return false;
      }
    } else {
      if (!words[i][0] || words[i][0] !== words[i][0].toLowerCase()) {
        return false;
      }
    }
  }

  return true;
}

export function isAuthorValid(author) {
  const regex = /^([A-Za-z.]+(?: [A-Za-z.]+)*, )*[A-Za-z.]+(?: [A-Za-z.]+)*(?:\.)? *$/;
  return regex.test(author);
}

export function isLinkValid(link) {
  const regex = new RegExp(
    "^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?" +
    "[a-z0-9]+([-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}" +
    "(:[0-9]{1,5})?(\\/.*)?$"
  );  
  return regex.test(link);
}

