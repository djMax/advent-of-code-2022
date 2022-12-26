import { Djikstra, EdgeMap, WeightedEdge } from 'lite-pathfindings';
import {
  getFile, log, Point, time,
} from '../index';
import { MatrixBoard } from '../MatrixBoard';

type Board = MatrixBoard<number>;

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
  grid: Board,
  from: Point,
  to: Point,
  blockList: Point[],
) {
  if (from.x < 0 || to.x < 0 || from.y < 0 || to.y < 0) {
    return false;
  }
  const dims = grid.dimension;
  if (from.x >= dims.x || to.x >= dims.x) {
    return false;
  }
  if (from.y >= dims.y || to.y >= dims.y) {
    return false;
  }
  if (blockList.find((p) => p.eq(to))) {
    return false;
  }
  const eStart = grid.at(from)!;
  const eEnd = grid.at(to)!;
  if (eEnd <= eStart + 1) {
    return true;
  }
  return false;
}

function gridToEdges(
  grid: Board,
  blockList: Point[],
  edgeInfo = (c: Point, v: number): [string, number] => [c.toString(), 27 - v],
) {
  const edges: EdgeMap = {};
  const dims = grid.dimension;
  for (let y = 0; y < dims.y; y += 1) {
    for (let x = 0; x < dims.x; x += 1) {
      const available: WeightedEdge = {};
      const xy = new Point(x, y);
      xy
        .nonDiagonalMoves
        .filter((p) => isValid(grid, xy, p, blockList))
        .forEach((p) => {
          const el = grid.at(p)!;
          const [edgeName, edgeWeight] = edgeInfo(p, el);
          available[edgeName] = edgeWeight;
        });
      const me = edgeInfo(xy, grid.at(xy)!)[0];
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
  const pred = Djikstra.init(gridToEdges(grid, [S]), S.toString());
  const path = Djikstra.getPath(pred, S.toString(), E.toString());
  return path.length - 1;
}

function part2(input: string) {
  const { grid, E } = getGridInfo(input);
  const edges = gridToEdges(grid, [], (c, v) => {
    if (v === 1) {
      // For part 2, all "A" values are equivalent to the end, so this greatly
      // simplifies the graph
      return ['a', 1];
    }
    return [c.toString(), 1];
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
