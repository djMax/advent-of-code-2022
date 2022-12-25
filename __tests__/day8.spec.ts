import day8 from '../src/days/day8';

const sample = `30373
25512
65332
33549
35390`;

describe('day 8', () => {
  test('sample data', () => {
    const grid = day8.parse(sample);
    expect(day8.part1(grid)).toEqual(21);
    expect(day8.part2(grid)).toEqual(8);
  });
});
