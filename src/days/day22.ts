import { getFile, log, time } from '../index';
import { Point } from '../Point';

enum Contents {
  Blank = ' ',
  Wall = '#',
  Available = '.',
}

enum Direction {
  Clockwise = 'R',
  Counterclockwise = 'L',
  NoChange = 'N',
}

interface Move {
  direction: Direction;
  steps: number;
}

enum Heading {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

interface PosDir {
  heading: Heading;
  position: Point;
}

const DELTAS: Record<Heading, Point> = {
  [Heading.Right]: new Point(1, 0),
  [Heading.Down]: new Point(0, 1),
  [Heading.Left]: new Point(-1, 0),
  [Heading.Up]: new Point(0, -1),
};


function parse(text: string) {
  const [boardStr, movesStr] = text.split('\n\n');
  const board = boardStr
    .split('\n')
    .map((line) => line
      .split('')
      .map(
        (c) => ({ ' ': Contents.Blank, '#': Contents.Wall, '.': Contents.Available }[c]
            || Contents.Blank),
      ));
  const { value, moves } = movesStr.split('').reduce(
    (acc, c) => {
      if (c === 'L' || c === 'R') {
        acc.moves.push({ direction: c as Direction, steps: acc.value });
        return { value: 0, moves: acc.moves };
      }
      return { value: acc.value * 10 + Number(c), moves: acc.moves };
    },
    { value: 0, moves: [] as Move[] },
  );
  if (value) {
    moves.push({ direction: Direction.NoChange, steps: value });
  }
  const start = board[0].findIndex((p) => p === Contents.Available);
  return { board, moves, start: new Point(start, 0) };
}

function nextPosition(
  board: Contents[][],
  position: Point,
  heading: Heading,
): Point | undefined {
  const delta = DELTAS[heading];
  const nX = position.x + delta.x;
  const nY = position.y + delta.y;
  const atPos = board[nY]?.[nX];

  if (atPos === Contents.Wall) {
    return undefined;
  }
  if (atPos === Contents.Available) {
    return new Point(nX, nY);
  }
  if (atPos !== undefined && atPos !== Contents.Blank) {
    throw new Error(`Position ${nX},${nY} is ${atPos} unexpectedly`);
  }

  const getStart = (dim: number) => {
    if (delta[dim === 0 ? 'x' : 'y'] === 0) {
      return position[dim === 0 ? 'x' : 'y'];
    }
    if (delta[dim === 0 ? 'x' : 'y'] > 0) {
      return 0;
    }
    if (dim === 0) {
      return board[nY].length - 1;
    }
    return board.length - 1;
  };
  const strPos = position.toString();
  for (
    let start = new Point(getStart(0), getStart(1));
    start.toString() !== strPos;
    start = new Point(start.x + delta.x, start.y + delta.y)
  ) {
    if (board[start.y][start.x] === Contents.Available) {
      // Negative direction, we already did the move
      return start;
    }
    if (board[start.y][start.x] === Contents.Wall) {
      return undefined;
    }
  }
  throw new Error(
    `Failed to loop around board from ${position} ${delta}. Tried ${nX},${nY} ${atPos}`,
  );
}

function moveN(
  board: Contents[][],
  position: Point,
  heading: Heading,
  count: number,
): Point {
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

function turn(heading: Heading, direction: Direction): Heading {
  if (direction === Direction.NoChange) {
    return heading;
  }

  const dirChange = direction === Direction.Clockwise ? 1 : -1;
  return (heading + 4 + dirChange) % 4 as Heading;
}

function score({ x, y }: Point, facing: Heading) {
  return 1000 * (y + 1) + 4 * (x + 1) + facing;
}

function walk(board: Contents[][], moves: Move[], start: Point) {
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

type WrapRule = [Point, (p: Point) => [Point, Heading]];

const Inf = Infinity;

const WrappingRules: WrapRule[][] = [
  [
    // R
    [new Point(Inf, 50), ({ y }) => [new Point(99, 149 - y), Heading.Left]],
    [new Point(Inf, 100), ({ y }) => [new Point(y + 50, 49), Heading.Up]],
    [new Point(Inf, 150), ({ y }) => [new Point(149, 149 - y), Heading.Left]],
    [new Point(Inf, 200), ({ y }) => [new Point(y - 100, 149), Heading.Up]],
  ],
  [
    // D
    [new Point(50, Inf), ({ x }) => [new Point(x + 100, 0), Heading.Down]],
    [new Point(100, Inf), ({ x }) => [new Point(49, x + 100), Heading.Left]],
    [new Point(150, Inf), ({ x }) => [new Point(99, x - 50), Heading.Left]],
  ],
  [
    // L
    [new Point(Inf, 50), ({ y }) => [new Point(0, 149 - y), Heading.Right]],
    [new Point(Inf, 100), ({ y }) => [new Point(y - 50, 100), Heading.Down]],
    [new Point(Inf, 150), ({ y }) => [new Point(50, 149 - y), Heading.Right]],
    [new Point(Inf, 200), ({ y }) => [new Point(y - 100, 0), Heading.Down]],
  ],
  [
    // U
    [new Point(50, Inf), ({ x }) => [new Point(50, x + 50), Heading.Right]],
    [new Point(100, Inf), ({ x }) => [new Point(0, x + 100), Heading.Right]],
    [new Point(150, Inf), ({ x }) => [new Point(x - 100, 199), Heading.Up]],
  ],
];

function walkCube({ board, moves, start }: ReturnType<typeof parse>): {
  heading: Heading;
  position: Point;
} {
  return moves.reduce(
    (acc, instruction) => {
      let { position: p, heading } = acc;
      const ruleFinder = ([b]: WrapRule) => p.every((c2, i) => c2 < b[i === 0 ? 'x' : 'y']);
      let { steps } = instruction;
      let facing = heading;
      let pos: Point;

      while (board[p.y]?.[p.x] !== Contents.Wall && steps >= 0) {
        const c = board[p.y]?.[p.x];
        if (c === Contents.Available) {
          pos = p;
          facing = heading;
          steps -= 1;
          p = new Point(DELTAS[heading].x + p.x, DELTAS[heading].y + p.y);
        } else {
          const wrapRule = WrappingRules[facing]!;
          [p, heading] = wrapRule.find(ruleFinder)![1](p);
        }
      }

      return { position: pos!, heading: turn(facing, instruction.direction) };
    },
    { position: start, heading: Heading.Right } as PosDir,
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
