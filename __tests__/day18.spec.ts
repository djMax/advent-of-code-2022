import { getLines } from '../src';

const sample = `2,2,2
1,2,2
3,2,2
2,1,2
2,3,2
2,2,1
2,2,3
2,2,4
2,2,6
1,2,5
3,2,5
2,1,5
2,3,5`.split('\n');

type Point = [number, number, number];

const ADJ: Point[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

function key(point: Point) {
  return point.join(',');
}

function add(point: Point, delta: Point): Point {
  return [point[0] + delta[0], point[1] + delta[1], point[2] + delta[2]];
}

function exposed(p: Point, occupied: Set<string>) {
  const occluded = ADJ.filter((delta) => occupied.has(key(add(p, delta))));
  return 6 - occluded.length;
}

function bounds(points: Point[]) {
  const max = points.reduce(
    (m, p) => [Math.max(m[0], p[0]), Math.max(m[1], p[1]), Math.max(m[2], p[2])],
    [0, 0, 0],
  ).map((n) => n + 1) as Point;
  const min = points.reduce(
    (m, p) => [Math.min(m[0], p[0]), Math.min(m[1], p[1]), Math.min(m[2], p[2])],
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  ).map((n) => n - 1) as Point;
  return { max, min };
}

function part1(points: Point[]) {
  const occupied = new Set<string>();
  points.forEach((point) => occupied.add(key(point)));
  return points.reduce((acc, point) => acc + exposed(point, occupied), 0);
}

function part2(points: Point[]) {
  const { max, min } = bounds(points);
  const inside = (p: Point) => p.every((n, i) => n >= min[i] && n <= max[i]);
  const occupied = new Set<string>();
  points.forEach((point) => occupied.add(key(point)));

  const outsideIn: Point[] = [];
  const q = [min];
  while (q.length) {
    const p = q.shift()!;
    outsideIn.push(p);
    ADJ.forEach((delta) => {
      const next = add(p, delta);
      const kNext = key(next);
      if (inside(next) && !occupied.has(kNext)) {
        occupied.add(kNext);
        q.push(next);
      }
    });
  }

  const lavaOnly = new Set<string>();
  points.forEach((point) => lavaOnly.add(key(point)));
  return outsideIn.reduce((acc, point) => {
    const expando = exposed(point, lavaOnly);
    return acc + 6 - expando;
  }, 0);
}

describe('day 18', () => {
  test('sample data', () => {
    const e = sample.map((line) => line.split(',').map((n) => Number(n)) as Point);
    expect(part1(e)).toEqual(64);
    expect(part2(e)).toEqual(58);
  });

  const points = getLines('day18.txt').map(
    (line) => line.split(',').map((n) => Number(n)) as Point,
  );
  test.todo(`Part 1 ${part1(points)} exposed sides`);
  test.todo(`Part 2 ${part2(points)} not including trapped air`);
});
