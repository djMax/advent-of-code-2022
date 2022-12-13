import { Djikstra, EdgeMap, WeightedEdge } from 'lite-pathfindings';
import { findInGrid, getLines, readGrid } from '../src/index';

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

function isValid(
  grid: number[][],
  from: [number, number],
  to: [number, number],
  blockList: [number, number][],
) {
  if (from[0] < 0 || to[0] < 0 || from[1] < 0 || to[1] < 0) {
    return false;
  }
  if (from[0] >= grid[0].length || to[0] >= grid[0].length) {
    return false;
  }
  if (from[1] >= grid.length || to[1] >= grid.length) {
    return false;
  }
  if (blockList.find((p) => p[0] === to[0] && p[1] === to[1])) {
    return false;
  }
  const eStart = grid[from[1]][from[0]];
  const eEnd = grid[to[1]][to[0]];
  if (eEnd <= eStart + 1) {
    return true;
  }
  return false;
}

function gridToEdges(
  grid: number[][],
  blockList: [number, number][],
  edgeInfo = (c: [number, number], v: number): [string, number] => [c.join(','), 27 - v],
) {
  const edges: EdgeMap = {};
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      const available: WeightedEdge = {};
      [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]
        .filter(([dx, dy]) => isValid(grid, [x, y], [x + dx, y + dy], blockList))
        .forEach(([dx, dy]) => {
          const el = grid[y + dy][x + dx];
          const [edgeName, edgeWeight] = edgeInfo([x + dx, y + dy], el);
          available[edgeName] = edgeWeight;
        });
      const me = edgeInfo([x, y], grid[y][x])[0];
      if (edges[me]) {
        Object.assign(edges[me], available);
      } else {
        edges[me] = available;
      }
    }
  }
  return edges;
}

function getGridInfo(lines: string[]) {
  const grid = readGrid(lines, elevation);
  const S = findInGrid(grid, 0)!;
  grid[S[1]][S[0]] = 1;
  const E = findInGrid(grid, -1)!;
  grid[E[1]][E[0]] = 26;
  return { grid, S, E };
}

function runPart1(lines: string[]) {
  const { grid, S, E } = getGridInfo(lines);
  const pred = Djikstra.init(gridToEdges(grid, [S]), S.join(','));
  const path = Djikstra.getPath(pred, S.join(','), E.join(','));
  // log(S, 'to', E, path);
  return { path, grid };
}

function runPart2(lines: string[]) {
  const { grid, E } = getGridInfo(lines);
  const edges = gridToEdges(grid, [], (c, v) => {
    if (v === 1) {
      // For part 2, all "A" values are equivalent to the end, so this greatly
      // simplifies the graph
      return ['a', 1];
    }
    return [c.join(','), 1];
  });
  const pred = Djikstra.init(edges, 'a');
  return Djikstra.getPath(pred, 'a', E.join(','));
}

describe('day 12', () => {
  test('sample data', () => {
    const { path } = runPart1(sample.split('\n'));
    expect(path).toBeTruthy();
    expect(path.length - 1).toEqual(31);
    const part2 = runPart2(sample.split('\n'));
    expect(part2.length - 1).toEqual(29);
  });

  const { path } = runPart1(getLines('day12.txt'));
  test.todo(`Part 1 result ${path.length - 1}`);

  const p2 = runPart2(getLines('day12.txt'));
  test.todo(`Part 2 result ${p2.length - 1}`);
});
