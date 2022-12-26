import {
  Cardinal, getFile, log, time,
} from '../index';
import { MatrixBoard } from '../MatrixBoard';
import { Point } from '../Point';

enum Contents {
  Blank = ' ',
  Wall = '#',
  Available = '.',
}

type Board = MatrixBoard<Contents>;

interface Move {
  steps: number;
  turn?: 'R' | 'L';
}

const DirectionOrder = 'ESWN';

interface PosDir {
  heading: Cardinal;
  position: Point;
}

function parse(text: string) {
  const [boardStr, movesStr] = text.split('\n\n');
  const board = MatrixBoard.read(boardStr, (c) => (c || ' ') as Contents);
  const { value, moves } = movesStr.split('').reduce(
    (acc, c) => {
      if (c === 'L' || c === 'R') {
        acc.moves.push({ turn: c, steps: acc.value });
        return { value: 0, moves: acc.moves };
      }
      return { value: acc.value * 10 + Number(c), moves: acc.moves };
    },
    { value: 0, moves: [] as Move[] },
  );
  if (value) {
    moves.push({ steps: value });
  }
  const start = board.contents[0].findIndex((p) => p === Contents.Available);
  return { board, moves, start: new Point(start, 0) };
}

function nextPosition(board: Board, position: Point, heading: Cardinal): Point | undefined {
  const next = position.move(heading);
  const atPos = board.at(next);

  if (atPos === Contents.Wall) {
    return undefined;
  }
  if (atPos === Contents.Available) {
    return next;
  }
  if (atPos !== undefined && atPos !== Contents.Blank) {
    throw new Error(`Position ${next.toString()} is ${atPos} unexpectedly`);
  }

  const dims = board.dimension;
  const delta = Point[heading];
  const getStartGivenDelta = (dim: 'x' | 'y') => {
    if (delta[dim] === 0) {
      return position[dim];
    }
    if (delta[dim] > 0) {
      return 0;
    }
    if (dim === 'x') {
      return dims.x - 1;
    }
    return dims.y - 1;
  };
  for (
    let start = new Point(getStartGivenDelta('x'), getStartGivenDelta('y'));
    !start.eq(position);
    start = new Point(start.x + delta.x, start.y + delta.y)
  ) {
    const at = board.at(start);
    if (at === Contents.Available) {
      // Negative direction, we already did the move
      return start;
    }
    if (at === Contents.Wall) {
      return undefined;
    }
  }
  throw new Error(
    `Failed to loop around board from ${position} ${delta}. Tried ${next.toString()} ${atPos}`,
  );
}

function moveN(board: Board, position: Point, heading: Cardinal, count: number): Point {
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

function turn(heading: Cardinal, direction?: 'R' | 'L'): Cardinal {
  if (!direction) {
    return heading;
  }

  const dirChange = direction === 'R' ? 1 : -1;
  const now = DirectionOrder.indexOf(heading);
  return DirectionOrder[(now + 4 + dirChange) % 4] as Cardinal;
}

function score({ x, y }: Point, facing: Cardinal) {
  return 1000 * (y + 1) + 4 * (x + 1) + DirectionOrder.indexOf(facing);
}

function walk(board: Board, moves: Move[], start: Point) {
  let position = start;
  let heading: Cardinal = 'E';
  moves.forEach((move) => {
    position = moveN(board, position, heading, move.steps);
    heading = turn(heading, move.turn);
  });
  return { position, heading };
}

function part1(boardStr: string) {
  const { board, moves, start } = parse(boardStr);
  const { position, heading } = walk(board, moves, start);
  return score(position, heading);
}

type WrapRule = [Point, (p: Point) => [Point, Cardinal]];

const Inf = Infinity;

const WrappingRules: Record<Cardinal, WrapRule[]> = {
  E: [
    [new Point(Inf, 50), ({ y }) => [new Point(99, 149 - y), 'W']],
    [new Point(Inf, 100), ({ y }) => [new Point(y + 50, 49), 'N']],
    [new Point(Inf, 150), ({ y }) => [new Point(149, 149 - y), 'W']],
    [new Point(Inf, 200), ({ y }) => [new Point(y - 100, 149), 'N']],
  ],
  S: [
    [new Point(50, Inf), ({ x }) => [new Point(x + 100, 0), 'S']],
    [new Point(100, Inf), ({ x }) => [new Point(49, x + 100), 'W']],
    [new Point(150, Inf), ({ x }) => [new Point(99, x - 50), 'W']],
  ],
  W: [
    [new Point(Inf, 50), ({ y }) => [new Point(0, 149 - y), 'E']],
    [new Point(Inf, 100), ({ y }) => [new Point(y - 50, 100), 'S']],
    [new Point(Inf, 150), ({ y }) => [new Point(50, 149 - y), 'E']],
    [new Point(Inf, 200), ({ y }) => [new Point(y - 100, 0), 'S']],
  ],
  N: [
    [new Point(50, Inf), ({ x }) => [new Point(50, x + 50), 'E']],
    [new Point(100, Inf), ({ x }) => [new Point(0, x + 100), 'E']],
    [new Point(150, Inf), ({ x }) => [new Point(x - 100, 199), 'N']],
  ],
};

function walkCube({ board, moves, start }: ReturnType<typeof parse>): {
  heading: Cardinal;
  position: Point;
} {
  return moves.reduce(
    (acc, instruction) => {
      let { position: p, heading } = acc;
      const ruleFinder = ([b]: WrapRule) => p.every((c2, i) => c2 < b[i === 0 ? 'x' : 'y']);
      let { steps } = instruction;
      let facing = heading;
      let pos: Point;

      while (board.at(p) !== Contents.Wall && steps >= 0) {
        const c = board.at(p);
        if (c === Contents.Available) {
          pos = p;
          facing = heading;
          steps -= 1;
          p = p.move(heading);
        } else {
          const wrapRule = WrappingRules[facing];
          [p, heading] = wrapRule.find(ruleFinder)![1](p);
        }
      }

      return { position: pos!, heading: turn(facing, instruction.turn) };
    },
    { position: start, heading: 'E' } as PosDir,
  );
}

function part2(boardStr: string) {
  const p = parse(boardStr);
  const final = walkCube(p);
  return score(final.position, final.heading);
}

if (typeof module === 'undefined' || require.main === module) {
  const grid = getFile('data/day22.txt');
  log(`Part 1: ${time(() => part1(grid))}`);
  log(`Part 2: ${time(() => part2(grid))}`);
}

export default {
  part1,
  part2,
  parse,
};
