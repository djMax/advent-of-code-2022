import { getLines, printGrid, readGrid } from "../src/index";

const sample = `30373
25512
65332
33549
35390`;

function transpose(matrix: number[][]) {
  const result: number[][] = [];
  for (let i = 0; i < matrix[0].length; i += 1) {
    result[i] = [];
    for (let j = 0; j < matrix.length; j += 1) {
      result[i][j] = matrix[j][i];
    }
  }
  return result;
}

function canSeeTree(grid: number[][], x: number, y: number) {
  if (x === 0 || y === 0 || x === grid[0].length - 1 || y === grid.length - 1) {
    return true;
  }

  const me = grid[y][x];
  const left = grid[y].slice(0, x);
  const right = grid[y].slice(x + 1);
  if (left.every((c) => c < me) || right.every((c) => c < me)) {
    return true;
  }
}

function visibleTrees(grid: number[][]) {
  const xpose = transpose(grid);
  let visible = 0;
  for (let y = 0; y < grid.length; y += 1) {
    const row = grid[y];
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

function scenicScore(grid: number[][], x: number, y: number) {
  const me = grid[y][x];
  const left = grid[y].slice(0, x).reverse();
  const right = grid[y].slice(x + 1);
  const lvd = treeCount(me, left);
  const rvd = treeCount(me, right);
  return lvd * rvd;
}

function maximumScenicScore(grid: number[][]) {
  const scores = [];
  const xpose = transpose(grid);
  for (let y = 1; y < grid.length - 1; y += 1) {
    const row = grid[y];
    for (let x = 1; x < row.length - 1; x += 1) {
      scores.push(scenicScore(grid, x, y) * scenicScore(xpose, y, x));
    }
  }
  return Math.max(...scores);
}

describe('day 8', () => {
  test('sample data', () => {
    const grid = readGrid(sample.split('\n'), (c) => Number(c));
    printGrid(grid);
    expect(visibleTrees(grid)).toEqual(21);
    expect(maximumScenicScore(grid)).toEqual(8);
  });

  test.todo(`Part 1 Result: ${visibleTrees(readGrid(getLines('day8.txt'), (c) => Number(c)))}`);
  test.todo(`Part 2 Result: ${maximumScenicScore(readGrid(getLines('day8.txt'), (c) => Number(c)))}`);
});
