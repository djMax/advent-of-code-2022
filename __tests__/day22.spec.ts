import day22 from '../src/days/day22';

const sample = `        ...#
        .#..
        #...
        ....
...#.......#
........#...
..#....#....
..........#.
        ...#....
        .....#..
        .#......
        ......#.

10R5L5R10L4R5L5`;

describe('day 22, part 1', () => {
  test('sample data', () => {
    expect(day22.part1(sample)).toBe(6032);
    // No tests for part 2 because the sample fold is different
    // and this is not a generic solution.
  });
});
