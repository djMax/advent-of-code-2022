import { getLines } from '../src/index';

const sample = `2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8`;

function fullOverlap(p1: [number, number], p2: [number, number]) {
  const [s1, e1] = p1;
  const [s2, e2] = p2;
  if (s1 <= s2 && e1 >= e2) {
    return true;
  }
  if (s2 <= s1 && e2 >= e1) {
    return true;
  }
  return false;
}

function anyOverlap(p1: [number, number], p2: [number, number]) {
  const [s1, e1] = p1;
  const [s2, e2] = p2;
  // Figure out if s1,e1 overlaps s2,e2 at all
  if (s1 <= s2 && e1 >= s2) {
    return true;
  }
  if (s2 <= s1 && e2 >= s1) {
    return true;
  }
  return false;
}

function parse(lines: string[]) {
  return lines.map((line) =>
    line.split(',').map((p) => p.split('-').map((n) => parseInt(n, 10)) as [number, number]),
  );
}

describe('day 4', () => {
  test('sample data', () => {
    const overlaps = parse(sample.split('\n')).filter((v) => fullOverlap(v[0], v[1])).length;
    expect(overlaps).toEqual(2);
    const any = parse(sample.split('\n')).filter((v) => anyOverlap(v[0], v[1])).length;
    expect(any).toEqual(4);
  });

  const part1 = parse(getLines('day4.txt')).filter((v) => fullOverlap(v[0], v[1])).length;
  test.todo(`Part 1 Result: ${part1}`);
  const part2 = parse(getLines('day4.txt')).filter((v) => anyOverlap(v[0], v[1])).length;
  test.todo(`Part 2 Result: ${part2}`);
});
