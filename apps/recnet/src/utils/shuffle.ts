import { Chance } from "chance";

export function shuffleArray<T>(_array: Array<T>, seed: string): Array<T> {
  const chance = new Chance(seed);
  const array = structuredClone(_array);
  return chance.shuffle(array);
}
