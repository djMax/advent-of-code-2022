import { Djikstra, EdgeMap, WeightedEdge } from 'lite-pathfindings';
import {
  getFile, log, Point, time,
} from '../index';
import { MatrixBoard } from '../MatrixBoard';

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
  blockList: Point[],
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
  if (blockList.find((p) => p.x === to[0] && p.y === to[1])) {
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
  blockList: Point[],
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

function getGridInfo(input: string) {
  const grid = MatrixBoard.read(input, elevation);
  const S = grid.forEach((p, v) => v === 0)!;
  grid.setAt(S.x, S.y, 1);
  const E = grid.forEach((p, v) => v === -1)!;
  grid.setAt(E.x, E.y, 26);
  return { grid, S, E };
}

function part1(input: string) {
  const { grid, S, E } = getGridInfo(input);
  const pred = Djikstra.init(gridToEdges(grid.contents, [S]), S.toString());
  const path = Djikstra.getPath(pred, S.toString(), E.toString());
  return path.length - 1;
}

function part2(input: string) {
  const { grid, E } = getGridInfo(input);
  const edges = gridToEdges(grid.contents, [], (c, v) => {
    if (v === 1) {
      // For part 2, all "A" values are equivalent to the end, so this greatly
      // simplifies the graph
      return ['a', 1];
    }
    return [c.join(','), 1];
  });
  const pred = Djikstra.init(edges, 'a');
  return Djikstra.getPath(pred, 'a', E.toString()).length - 1;
}

if (typeof module === 'undefined' || require.main === module) {
  const grid = getFile('data/day12.txt');
  log(`Part 1: ${time(() => part1(grid))}`);
  log(`Part 2: ${time(() => part2(grid))}`);
}

export default {
  part1,
  part2,
};
