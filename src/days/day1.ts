import { getFile, log, time } from '../index';

function parse(input: string) {
  const elves = input.split('\n\n').map((l) => l.split('\n').map(Number));
  // Compute the sum of each elf's calories
  return elves.map((elf) => elf.reduce((acc, c) => acc + c, 0)).sort((a, b) => b - a);
}

const part1 = (calories: number[]) => calories[0];
const part2 = (calories: number[]) => calories.slice(0, 3).reduce((acc, c) => acc + c, 0);

if (typeof module === 'undefined' || require.main === module) {
  const calories = parse(getFile('data/day1.txt'));
  log(`Part 1: ${time(() => part1(calories))}`);
  log(`Part 2: ${time(() => part2(calories))}`);
}

export default {
  parse,
  part1,
  part2,
};
