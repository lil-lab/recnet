export function interleaveWithValue<T>(
  arr: Array<T>,
  insertValue: T
): Array<T> {
  return arr.flatMap((value, index) => {
    if (index === arr.length - 1) {
      return [value];
    }
    return [value, insertValue];
  });
}
