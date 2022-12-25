import day12 from '../src/days/day12';

const sample = `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`;

describe('day 12', () => {
  test('sample data', () => {
    expect(day12.part1(sample)).toEqual(31);
    expect(day12.part2(sample)).toEqual(29);
  });
});
