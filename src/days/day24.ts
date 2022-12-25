import {
  Cardinal, getFile, log, time,
} from '../index';
import { MatrixBoard } from '../MatrixBoard';
import { Point } from '../Point';

enum Contents {
  Elf = 'E',
  Wall = '#',
  Available = '.',
  BlizzardUp = '^',
  BlizzardDown = 'v',
  BlizzardLeft = '<',
  BlizzardRight = '>',
}

type Blizzard =
  | Contents.BlizzardUp
  | Contents.BlizzardDown
  | Contents.BlizzardLeft
  | Contents.BlizzardRight;

const BlizzardMovement: Record<Blizzard, Cardinal> = {
  [Contents.BlizzardUp]: 'N',
  [Contents.BlizzardDown]: 'S',
  [Contents.BlizzardLeft]: 'W',
  [Contents.BlizzardRight]: 'E',
} as const;

type BlizzardPositions = Record<string, Contents[]>;
type PositionsByTurn = Record<number, BlizzardPositions>;

interface State {
  round: number;
  path: Point[];
  blizzards: BlizzardPositions;
  score: number;
}

interface World {
  blizzards: PositionsByTurn;
  start: Point;
  target: Point;
  w: number;
  h: number;
  initial: State;
}

function parse(input: string): World {
  const board = MatrixBoard.read(input, (c) => c as Contents);
  const startX = board.contents[0].indexOf(Contents.Available);
  const h = board.contents.length;
  const end = board.contents[h - 1].indexOf(Contents.Available);
  const blizzards: BlizzardPositions = {};
  board.forEach(
    (p, v) => {
      const k = p.toString();
      blizzards[k] = blizzards[k] || [];
      blizzards[k].push(v);
    },
    (p, v) => v !== Contents.Wall && v !== Contents.Available,
  );

  const start = new Point(startX, 0);
  const target = new Point(end, h - 1);
  return {
    blizzards: { 0: blizzards },
    start,
    target,
    w: board.dimension.x,
    h: board.dimension.y,
    initial: {
      round: 0,
      path: [start],
      blizzards,
      score: Point.manhattanDistance(start, target),
    },
  };
}

function possibleMoves(world: World, { path, blizzards }: State): Point[] {
  return path[path.length - 1].nonDiagonalMoves.filter((p) => {
    if (blizzards[p.toString()]?.length) {
      return false;
    }
    if (p.eq(path[0]) || p.eq(world.target)) {
      return true;
    }
    // Wall
    if (p.x <= 0 || p.x >= world.w - 1 || p.y <= 0 || p.y >= world.h - 1) {
      return false;
    }
    return true;
  });
}

function rollover(world: World, p: Point) {
  if (p.x === 0) {
    return new Point(world.w - 2, p.y);
  }
  if (p.x === world.w - 1) {
    return new Point(1, p.y);
  }
  if (p.y === 0) {
    // This was not well specified. But what is fascinating - it doesn't matter.
    // I assume they avoided putting veritical blizzards in the entry/exit columns
    if (!p.eq(world.start)) {
      return new Point(p.x, world.h - 2);
    }
  }
  if (p.y === world.h - 1) {
    if (!p.eq(world.target)) {
      return new Point(p.x, 1);
    }
  }
  return p;
}

function moveBlizzards(world: World, now: BlizzardPositions): BlizzardPositions {
  const updated: BlizzardPositions = {};
  let preLength = 0;
  let postLength = 0;
  Object.entries(now).forEach(([k, blizzards]) => {
    preLength += blizzards.length;
    blizzards.forEach((blizzard) => {
      const p = rollover(world, new Point(k).move(BlizzardMovement[blizzard as Blizzard]));
      const nk = p.toString();
      postLength += 1;
      updated[nk] = updated[nk] || [];
      updated[nk].push(blizzard);
    });
  });
  if (preLength !== postLength) {
    throw new Error('Blizzard disappeared');
  }
  return updated;
}

function getBlizzardPosition(world: World, rounds: number) {
  if (world.blizzards[rounds]) {
    return world.blizzards[rounds];
  }
  const previous = getBlizzardPosition(world, rounds - 1);
  const updated = moveBlizzards(world, previous);
  world.blizzards[rounds] = updated;
  return updated;
}

function printBlizzards(world: World, state: State) {
  const board: string[][] = [];
  for (let y = 0; y < world.h; y += 1) {
    board[y] = [];
    for (let x = 0; x < world.w; x += 1) {
      const p = new Point(x, y);
      const at = state.blizzards[p.toString()];
      if (at) {
        if (at.length > 1) {
          board[y][x] = String(at.length);
        } else {
          board[y][x] = at[0] as Contents;
        }
      } else if (p.eq(state.path[state.path.length - 1])) {
        board[y][x] = Contents.Elf;
      } else if (p.eq(world.start) || p.eq(world.target)) {
        board[y][x] = Contents.Available;
      } else if (x === 0 || x === world.w - 1 || y === 0 || y === world.h - 1) {
        board[y][x] = Contents.Wall;
      } else {
        board[y][x] = Contents.Available;
      }
    }
  }
  log(new MatrixBoard(board).toString());
}

function validStates(world: World, state: State): State[] {
  const blizzards = getBlizzardPosition(world, state.round + 1);
  const next = { ...state, blizzards, round: state.round + 1 };
  const moves = possibleMoves(world, next);
  if (moves.find((p) => p.eq(world.target))) {
    return [
      {
        ...next,
        path: [...state.path, world.target],
      },
    ];
  }
  const validMoves = moves.map((p) => ({
    ...next,
    path: [...state.path, p],
    score: Point.manhattanDistance(world.target, p),
  }));

  if (blizzards[state.path[state.path.length - 1].toString()]?.length) {
    // Waiting is not an option, we need to move
    return validMoves;
  }
  return [
    // Add a waiting move
    next,
    ...validMoves,
  ];
}

function part1(world: World) {
  const q = [world.initial];
  let minRounds = Infinity;
  let rounds = 0;

  // Number of minutes and position are equivalent, so if we come across
  // the same, prune.
  const seen = new Set<string>();

  while (q.length) {
    const nextState = q.shift()!;
    const stateKey = `${nextState.round} ${nextState.path[nextState.path.length - 1].toString()}`;
    if (nextState.round >= minRounds || seen.has(stateKey)) {
      continue; // Abandon this branch, it's too long
    }
    seen.add(stateKey);
    rounds += 1;
    if (rounds % 1000 === 0) {
      q.sort((a, b) => a.score - b.score || a.round - b.round);
    }
    if (nextState.path[nextState.path.length - 1].eq(world.target)) {
      if (nextState.round < minRounds) {
        minRounds = nextState.round;
      }
    } else {
      const validNext = validStates(world, nextState);
      q.push(...validNext);
    }
  }
  return minRounds;
}

function part2(world: World) {
  const toEnd = part1(world);
  const toBeginning = part1({
    ...world,
    start: world.target,
    target: world.start,
    initial: {
      blizzards: getBlizzardPosition(world, toEnd),
      path: [world.target],
      round: toEnd,
      score: world.initial.score,
    },
  });
  const toEndAgain = part1({
    ...world,
    initial: {
      blizzards: getBlizzardPosition(world, toBeginning),
      path: [world.start],
      round: toBeginning,
      score: world.initial.score,
    },
  });
  return toEndAgain;
}

export default {
  parse,
  part1,
  part2,
};

if (typeof module === 'undefined' || require.main === module) {
  const world = parse(getFile('./data/day24.txt'));
  log(
    'Part 1',
    time(() => part1(world)),
  );
  log(
    'Part 2',
    time(() => part2(world)),
  );
}
