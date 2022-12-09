import { getLines } from '../src/index';

describe('day 1', () => {
  const lines = getLines('day1.txt');
  expect(lines).toBeTruthy();
  expect(lines.length).toBeGreaterThan(0);

  const elves = lines.reduce((acc, l) => {
    if (l) {
      acc[acc.length - 1].push(parseInt(l, 10));
    } else {
      acc.push([]);
    }
    return acc;
  }, [[]] as number[][]);

  // Compute the sum of each elf's calories
  const calories = elves
    .map((elf) => elf.reduce((acc, c) => acc + c, 0))
    .sort((a, b) => b - a);
  // Find the maximum
  const [max] = calories;
  test.todo(`Part 1 Result: ${max}`);
  expect(max).toBe(72240);

  // Sum the top 4 calories
  const top = calories.slice(0, 3).reduce((acc, c) => acc + c, 0);
  test.todo(`Part 2 Result: ${top}`);
});
