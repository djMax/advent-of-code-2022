import { findInGrid, getLines, log, printGrid, readGrid } from '../src/index';

const sample = `Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi`;

function elevation(v: string) {
  if (v === 'S') {
    return 0;
  }
  if (v === 'E') {
    return -1;
  }
  return v.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

interface CandidatePath {
  path: string[];
  at: [number, number];
}

function isValid(grid: number[][], start: [number, number], end: [number, number]) {
  if (start[0] < 0 || end[0] < 0 || start[1] < 0 || end[1] < 0) {
    return false;
  }
  if (start[0] >= grid[0].length || end[0] >= grid[0].length) {
    return false;
  }
  if (start[1] >= grid.length || end[1] >= grid.length) {
    return false;
  }
  const eStart = grid[start[1]][start[0]];
  const eEnd = grid[end[1]][end[0]];
  if (eEnd === -1) {
    // This case is handled elsewhere, so if we are here it's because we can't reach the end yet
    return false;
  }
  if (eEnd <= eStart + 1) {
    return true;
  }
  return false;
}

function findShortestPath(grid: number[][], from: CandidatePath) {
  const queue = [from];
  let best: string[] | undefined;

  const setBest = (b: string[]) => {
    // log('Found the end!', b);
    best = b;
  };

  const isGreaterThanBest = (n: number) => best && best.length < n;

  while (queue.length) {
    const cur = queue.shift()!;
    const key = `${cur.at[0]},${cur.at[1]}`;
    if (!from.path.includes(key)) {
      [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ].forEach(([dx, dy]) => {
        const spot = grid[cur.at[1]][cur.at[0]];
        const next = [cur.at[0] + dx, cur.at[1] + dy] as [number, number];
        const nextKey = next.join(',');
        if (grid[next[1]]?.[next[0]] === -1 && spot >= 25) {
          // We found the end!
          setBest([...cur.path, cur.at.join(','), next.join(',')]);
          return;
        }
        if (isGreaterThanBest(cur.path.length + 2) || cur.path.includes(nextKey)) {
          return;
        }
        if (isValid(grid, cur.at, [cur.at[0] + dx, cur.at[1] + dy])) {
          queue.push({ path: [...cur.path, key], at: next });
        }
      });
    }
  }
  return best;
}

describe('day 12', () => {
  test('sample data', () => {
    const grid = readGrid(sample.split('\n'), elevation);
    const S = findInGrid(grid, 0)!;
    printGrid(grid, 4);
    const path = findShortestPath(grid, { path: [], at: S });
    expect(path).toBeTruthy();
    expect(path?.length).toEqual(32);
  });

  const grid = readGrid(getLines('day12.txt'), elevation);
  const sp = findShortestPath(grid, { path: [], at: findInGrid(grid, 0)! });
  test.todo(`Part 1 result ${sp ? sp.length - 1 : 'not found'}`);
});
