import { getFile, log, time } from '../index';
import { MatrixBoard } from '../MatrixBoard';

type Board = MatrixBoard<number>;

function canSeeTree(grid: Board, x: number, y: number) {
  const dims = grid.dimension;
  if (x === 0 || y === 0 || x === dims.x - 1 || y === dims.y - 1) {
    return true;
  }

  const me = grid.at(x, y)!;
  const left = grid.row(y).slice(0, x);
  const right = grid.row(y).slice(x + 1);
  if (left.every((c) => c < me) || right.every((c) => c < me)) {
    return true;
  }
  return false;
}

function part1(grid: Board) {
  const xpose = grid.transpose();
  let visible = 0;
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid.row(y);
    for (let x = 0; x < row.length; x += 1) {
      if (canSeeTree(grid, x, y) || canSeeTree(xpose, y, x)) {
        visible += 1;
      }
    }
  }
  return visible;
}

function treeCount(me: number, others: number[]) {
  const spot = others.findIndex((c) => c >= me);
  if (spot === -1) {
    return others.length;
  }
  if (spot) {
    return spot + 1;
  }
  return 1;
}

function scenicScore(grid: Board, x: number, y: number) {
  const me = grid.at(x, y)!;
  const left = grid.row(y).slice(0, x).reverse();
  const right = grid.row(y).slice(x + 1);
  const lvd = treeCount(me, left);
  const rvd = treeCount(me, right);
  return lvd * rvd;
}

function part2(grid: Board) {
  const scores = [];
  const xpose = grid.transpose();
  for (let y = 1; y < grid.length - 1; y += 1) {
    const row = grid.row(y);
    for (let x = 1; x < row.length - 1; x += 1) {
      scores.push(scenicScore(grid, x, y) * scenicScore(xpose, y, x));
    }
  }
  return Math.max(...scores);
}

function parse(input: string) {
  return MatrixBoard.read(input, (c) => Number(c));
}

if (typeof module === 'undefined' || require.main === module) {
  const grid = parse(getFile('data/day8.txt'));
  log(`Part 1: ${time(() => part1(grid))}`);
  log(`Part 2: ${time(() => part2(grid))}`);
}

export default {
  parse,
  part1,
  part2,
};
