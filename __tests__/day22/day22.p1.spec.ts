import assert from 'assert';
import { getFile } from '../../src/index';
import {
  DELTAS, parse, score, turn,
} from './board';
import {
  Move, Contents, Position, Heading,
} from './types';

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

function nextPosition(
  board: Contents[][],
  position: Position,
  heading: Heading,
): [number, number] | undefined {
  const delta = DELTAS[heading];
  const nX = position[0] + delta[0];
  const nY = position[1] + delta[1];
  const atPos = board[nY]?.[nX];

  if (atPos === Contents.Wall) {
    return undefined;
  }
  if (atPos === Contents.Available) {
    return [nX, nY];
  }
  assert(
    atPos === undefined || atPos === Contents.Blank,
    `Position ${nX},${nY} is ${atPos} unexpectedly`,
  );

  const getStart = (dim: number) => {
    if (delta[dim] === 0) {
      return position[dim];
    }
    if (delta[dim] > 0) {
      return 0;
    }
    if (dim === 0) {
      return board[nY].length - 1;
    }
    return board.length - 1;
  };
  const strPos = position.join(',');
  for (
    let start = [getStart(0), getStart(1)] as [number, number];
    start.join(',') !== strPos;
    start = [start[0] + delta[0], start[1] + delta[1]]
  ) {
    if (board[start[1]][start[0]] === Contents.Available) {
      // Negative direction, we already did the move
      return start;
    }
    if (board[start[1]][start[0]] === Contents.Wall) {
      return undefined;
    }
  }
  throw new Error(
    `Failed to loop around board from ${position} ${delta}. Tried ${nX},${nY} ${atPos}`,
  );
}

function moveN(
  board: Contents[][],
  position: [number, number],
  heading: Heading,
  count: number,
): [number, number] {
  let cur = position;
  for (let i = 0; i < count; i += 1) {
    const n = nextPosition(board, cur, heading);
    if (!n) {
      return cur;
    }
    cur = n;
  }
  return cur;
}

function walk(board: Contents[][], moves: Move[], start: Position) {
  let position = start;
  let heading = Heading.Right;
  moves.forEach((move) => {
    position = moveN(board, position, heading, move.steps);
    heading = turn(heading, move.direction);
  });
  return { position, heading };
}

function part1(boardStr: string) {
  const { board, moves, start } = parse(boardStr);
  const { position, heading } = walk(board, moves, start);
  return score(position, heading);
}

describe('day 22, part 1', () => {
  test('sample data', () => {
    expect(part1(sample)).toBe(6032);
  });

  test.todo(`Part 1: ${part1(getFile('./data/day22.txt'))}`);
});
