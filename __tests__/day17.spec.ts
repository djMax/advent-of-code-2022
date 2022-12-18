import { getLines, log } from '../src';

const sample = '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>';

const rockOrder = ['-', '+', 'J', 'I', 'o'] as const;
type Shape = typeof rockOrder[number];

function d(x: number, y: number, dx: number, dy: number): [number, number] {
  return [x + dx, y + dy];
}

const W = {
  '-': 3,
  '+': 2,
  J: 2,
  I: 0,
  o: 1,
} as const;

const H = {
  '-': 0,
  '+': 2,
  J: 2,
  I: 3,
  o: 1,
} as const;

function getShape(shape: Shape, x: number, y: number): [number, number][] {
  switch (shape) {
    case '-':
      return [[x, y], d(x, y, 1, 0), d(x, y, 2, 0), d(x, y, 3, 0)];
    case '+':
      return [d(x, y, 0, 1), d(x, y, 1, 0), d(x, y, 1, 1), d(x, y, 2, 1), d(x, y, 1, 2)];
    case 'J':
      return [d(x, y, 0, 0), d(x, y, 1, 0), d(x, y, 2, 0), d(x, y, 2, 1), d(x, y, 2, 2)];
    case 'I':
      return [[x, y], d(x, y, 0, 1), d(x, y, 0, 2), d(x, y, 0, 3)];
    case 'o':
      return [[x, y], d(x, y, 1, 0), d(x, y, 0, 1), d(x, y, 1, 1)];
    default:
      throw new Error(`Unknown shape ${shape}`);
  }
}

class Rock {
  points: [number, number][];

  left: number;

  bottom: number;

  constructor(public shape: Shape, bottomLeft: [number, number], public stopped = false) {
    [this.left, this.bottom] = bottomLeft;
    this.points = getShape(shape, this.left, this.bottom);
  }

  get right() {
    return this.left + W[this.shape];
  }

  get top() {
    return this.bottom + H[this.shape];
  }
}

function push(rock: Rock, left: boolean, occupied: Set<string>) {
  if ((rock.left === 0 && left) || (rock.right === 6 && !left)) {
    return;
  }
  const l = left ? rock.left - 1 : rock.left + 1;
  const pts = getShape(rock.shape, l, rock.bottom)
  if (pts.find(([x, y]) => occupied.has(`${x},${y}`))) {
    return;
  }
  rock.left = l;
  rock.points = pts;
}

function drop(rock: Rock, occupied: Set<string>) {
  if (rock.bottom === 0) {
    rock.stopped = true;
    return;
  }

  const pts = getShape(rock.shape, rock.left, rock.bottom - 1);
  if (pts.find(([x, y]) => occupied.has(`${x},${y}`))) {
    rock.stopped = true;
    return;
  }
  rock.bottom -= 1;
  rock.points = pts;
}

function print(occupied: Set<string>, cur: Rock, height: number) {
  const at = (x: number, y: number) => {
    if (occupied.has(`${x},${y}`)) {
      return '#';
    }
    if (cur.points.find((p) => p[0] === x && p[1] === y)) {
      return '@';
    }
    return '.';
  };
  for (let y = Math.max(3, height + 1, cur.top); y >= 0; y -= 1) {
    const r = [0, 1, 2, 3, 4, 5, 6].map((x) => at(x, y));
    log(`${String(y).padEnd(4)} |${r.join('')}|`);
  }
  log('     |-------|\n');
}

function getKeyForState(tops: number[], shape: Shape, windIndex: number) {
  return `${tops.map((t) => t - tops[0]).join('')}${shape}${windIndex}`;
}

interface PreviousState {
  rocksThen: number;
  heightThen: number;
}

function run(wind: string, rocks: number) {
  let rockIndex = 0;
  let windIndex = 0;
  let maxY = -1;
  const terrainMap: Record<string, PreviousState> = {};
  const occupied = new Set<string>();
  const tops = Array(7).fill(0);
  let boosted = 0;

  const placeRock = ([x, y]: [number, number]) => {
    maxY = Math.max(maxY, y);
    tops[Number(x)] = Math.max(tops[x], y);
    occupied.add(`${x},${y}`);
  };

  for (let r = 1; r <= rocks; r += 1) {
    const rock = new Rock(rockOrder[rockIndex], [2, maxY + 4]);
    while (!rock.stopped) {
      push(rock, wind[windIndex] === '<', occupied);
      drop(rock, occupied);
      windIndex = (windIndex + 1) % wind.length;
    }
    rockIndex = (rockIndex + 1) % rockOrder.length;
    rock.points.forEach(placeRock);

    const thash = getKeyForState(tops, rock.shape, windIndex);
    if (terrainMap[thash] !== undefined) {
      const { rocksThen, heightThen } = terrainMap[thash];
      const rockCycle = r - rocksThen;
      const heightDelta = maxY - heightThen;
      const loops = Math.floor((rocks - r) / rockCycle);
      if (loops) {
        // log(
        //   `Cycle at ${r}: ${rockCycle} rocks ${loops} times. Adding ${loops * heightDelta}`,
        // );
        r += loops * rockCycle;
        boosted = loops * heightDelta;
      }
    }
    terrainMap[thash] = { rocksThen: r, heightThen: maxY };
  }
  return maxY + boosted + 1;
}

describe('day 17', () => {
  test('sample data', () => {
    expect(run(sample, 2022)).toEqual(3068);
    expect(run(sample, 1000000000000)).toEqual(1514285714288);
  });

  const [data] = getLines('day17.txt');
  test.todo(`Part 1: ${run(data, 2022)}`);
  test.todo(`Part 2: ${run(data, 1000000000000)}`);
});
