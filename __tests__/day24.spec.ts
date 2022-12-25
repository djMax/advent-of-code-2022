import { log } from '../src';
import day24 from '../src/days/day24';

const sample = `#.######
#>>.<^<#
#.<..<<#
#>v.><>#
#<^v^^>#
######.#`;

describe('day 24', () => {
  test('sample data', () => {
    const world = day24.parse(sample);
    expect(day24.part1(world)).toEqual(18);
    expect(day24.part2(world)).toEqual(54);
  });
});
