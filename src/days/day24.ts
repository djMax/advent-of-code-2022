import {
  Cardinal, getFile, log, time,
} from '../index';
import { MatrixBoard } from '../MatrixBoard';
import { optimizedSearch, State, World } from '../optimizedSearch';
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

interface ElfWorld extends World {
  blizzards: PositionsByTurn;
  start: Point;
  target: Point;
  distance: number;
  w: number;
  h: number;
}

function parse(input: string): ElfWorld {
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
    distance: Point.manhattanDistance(start, target),
    w: board.dimension.x,
    h: board.dimension.y,
  };
}

function possibleMoves(world: ElfWorld, { path, blizzards }: ElfState): Point[] {
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

function rollover(world: ElfWorld, p: Point) {
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

function moveBlizzards(world: ElfWorld, now: BlizzardPositions): BlizzardPositions {
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

function getBlizzardPosition(world: ElfWorld, rounds: number) {
  if (world.blizzards[rounds]) {
    return world.blizzards[rounds];
  }
  const previous = getBlizzardPosition(world, rounds - 1);
  const updated = moveBlizzards(world, previous);
  world.blizzards[rounds] = updated;
  return updated;
}

class ElfState implements State<ElfWorld> {
  expectedScore: number;

  completed: boolean;

  constructor(
    world: ElfWorld,
    public round: number,
    public path: Point[],
    public blizzards: BlizzardPositions,
  ) {
    const at = path[path.length - 1];
    this.expectedScore = world.distance - Point.manhattanDistance(world.target, at);
    this.completed = at.eq(world.target);
  }

  get key() {
    return `${this.round} ${this.path[this.path.length - 1].toString()}`;
  }

  compare(other: this): number {
    return other.round - this.round;
  }

  createNextState(world: ElfWorld, next?: Point) {
    const blizzards = getBlizzardPosition(world, this.round + 1);
    const path = next ? [...this.path, next] : this.path;
    return new ElfState(world, this.round + 1, path, blizzards);
  }

  getNextStates(world: ElfWorld) {
    const next = this.createNextState(world);
    const moves = possibleMoves(world, next);
    if (moves.find((p) => p.eq(world.target))) {
      return [this.createNextState(world, world.target)];
    }
    const validMoves = moves.map((p) => this.createNextState(world, p));
    if (next.blizzards[this.path[this.path.length - 1].toString()]?.length) {
      // Waiting is not an option, we need to move
      return validMoves;
    }
    return [
      // Add a waiting move
      next,
      ...validMoves,
    ];
  }
}

function part1(world: ElfWorld) {
  const initial = new ElfState(world, 0, [world.start], getBlizzardPosition(world, 0));
  const best = optimizedSearch(world, initial);
  return best?.round;
}

function part2(world: ElfWorld) {
  const toEnd = optimizedSearch(
    world,
    new ElfState(world, 0, [world.start], getBlizzardPosition(world, 0)),
  )!;
  const upsideDown: ElfWorld = {
    ...world,
    target: world.start,
    start: world.target,
  };
  const toBeginning = optimizedSearch(
    upsideDown,
    new ElfState(upsideDown, toEnd.round, [world.target], getBlizzardPosition(world, toEnd.round)),
  )!;
  const toEndAgain = optimizedSearch(
    world,
    new ElfState(
      world,
      toBeginning.round,
      [world.start],
      getBlizzardPosition(world, toBeginning.round),
    ),
  )!;
  return toEndAgain.round;
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
