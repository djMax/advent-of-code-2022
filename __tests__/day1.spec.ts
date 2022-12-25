import day1 from '../src/days/day1';

const sample = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`;

test('day 1', () => {
  const parsed = day1.parse(sample);
  expect(day1.part1(parsed)).toEqual(24000);
  expect(day1.part2(parsed)).toEqual(45000);
});
