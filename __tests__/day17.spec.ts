import lodash from 'lodash';
import { getLines, log } from '../src';

const sample = '>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>';
// I don't think this is technically correct, but it is a very useful simplification.
// Pathalogical wind patters would make it wrong.
const MAX_RELEVANT_ROCKS = 20;

const rockOrder = ['-', '+', 'J', 'I', 'o'];
type Shape = typeof rockOrder[number];

function d(p: [number, number], dx: number, dy: number): [number, number] {
  return [p[0] + dx, p[1] + dy];
}

function s(...args: [number, number][]): string[] {
  return args.map((p) => p.join(','));
}

function getShape(shape: Shape, p: [number, number]) {
  switch (shape) {
    case '-':
      return s(p, d(p, 1, 0), d(p, 2, 0), d(p, 3, 0));
    case '+':
      return s(d(p, 0, 1), d(p, 1, 0), d(p, 1, 1), d(p, 2, 1), d(p, 1, 2));
    case 'J':
      return s(d(p, 0, 0), d(p, 1, 0), d(p, 2, 0), d(p, 2, 1), d(p, 2, 2));
    case 'I':
      return s(p, d(p, 0, 1), d(p, 0, 2), d(p, 0, 3));
    case 'o':
      return s(p, d(p, 1, 0), d(p, 0, 1), d(p, 1, 1));
    default:
      throw new Error(`Unknown shape ${shape}`);
  }
}

class Rock {
  points: string[];

  constructor(
    public shape: Shape,
    private bottomLeft: [number, number],
    public stopped = false,
  ) {
    this.points = getShape(shape, bottomLeft);
  }

  get left() {
    return this.bottomLeft[0];
  }

  get bottom() {
    return this.bottomLeft[1];
  }

  get right() {
    switch (this.shape) {
      case '-':
        return this.left + 3;
      case '+':
      case 'J':
        return this.left + 2;
      case 'I':
        return this.left;
      case 'o':
        return this.left + 1;
      default:
        throw new Error(`Unknown shape ${this.shape}`);
    }
  }

  get top() {
    switch (this.shape) {
      case '-':
        return this.bottom;
      case '+':
      case 'J':
        return this.bottom + 2;
      case 'I':
        return this.bottom + 3;
      case 'o':
        return this.bottom + 1;
      default:
        throw new Error(`Unknown shape ${this.shape}`);
    }
  }

  overlaps(other: Rock) {
    return lodash.intersection(this.points, other.points).length > 0;
  }
}

function push(rock: Rock, left: boolean, rocks: Rock[]) {
  let candidate: Rock | undefined;
  if (left && rock.left > 0) {
    candidate = new Rock(rock.shape, [rock.left - 1, rock.bottom]);
  } else if (!left && rock.right < 6) {
    candidate = new Rock(rock.shape, [rock.left + 1, rock.bottom]);
  }
  if (!candidate || rocks.find((r) => r.overlaps(candidate!))) {
    return rock;
  }
  return candidate;
}

function drop(rock: Rock, rocks: Rock[]) {
  if (rock.bottom === 0) {
    rock.stopped = true;
    return rock;
  }

  const candidate = new Rock(rock.shape, [rock.left, rock.bottom - 1]);
  if (rocks.find((r) => r.overlaps(candidate))) {
    rock.stopped = true;
    return rock;
  }
  return candidate;
}

function print(rocks: Rock[]) {
  const maxY = Math.max(Math.max(...rocks.map((r) => r.top)), 3);
  const at = (x: number, y: number) => {
    const resident = rocks.find((r) => r.points.includes(`${x},${y}`));
    if (resident) {
      return resident.stopped ? '#' : '@';
    }
    return '.';
  };
  const lines = [];
  for (let y = maxY; y >= 0; y -= 1) {
    const r = [0, 1, 2, 3, 4, 5, 6].map((x) => at(x, y));
    if (r.length !== 7) {
      throw new Error(r.join(','));
    }
    lines.push(`${String(y).padEnd(4)} |${r.join('')}|`);
  }
  lines.push('     |-------|\n');
  return lines;
}

function terrain(tops: number[], shape: Shape, windIndex: number) {
  return `${tops.map((t) => t - tops[0]).join('')}${shape}${windIndex}`;
}

interface PreviousState {
  rocksThen: number;
  heightThen: number;
  info: string[];
}

function run(wind: string, rocks: number) {
  let rockIndex = 0;
  let windIndex = 0;
  const terrainMap: Record<string, PreviousState> = {};
  let exposedRocks: Rock[] = [];
  const tops = Array(7).fill(0);
  let boosted = 0;

  for (let r = 1; r <= rocks; r += 1) {
    const startY = Math.max(...exposedRocks.map((rr) => rr.top), -1);
    let rock = new Rock(rockOrder[rockIndex], [2, startY + 4]);
    // log('Create rock', rock.shape, 'at', rock.left, rock.bottom, startY, tops.join(','));
    // log(print([...exposedRocks, rock]).join('\n'));
    while (!rock.stopped) {
      // log('Apply', wind[windIndex], 'and drop');
      rock = push(rock, wind[windIndex] === '<', exposedRocks);
      rock = drop(rock, exposedRocks);
      // log(print([...exposedRocks, rock]).join('\n'));
      windIndex = (windIndex + 1) % wind.length;
    }
    rockIndex = (rockIndex + 1) % rockOrder.length;
    exposedRocks.unshift(rock);

    tops.forEach((y, x) => {
      if (x >= rock.left && x <= rock.right) {
        for (let yy = y + 1; yy <= rock.top; yy += 1) {
          if (rock.points.includes(`${x},${yy}`)) {
            tops[x] = yy;
          }
        }
      }
    });

    const h = Math.max(...exposedRocks.map((r2) => r2.top));
    const thash = terrain(tops, rock.shape, windIndex);
    if (terrainMap[thash] !== undefined) {
      const { rocksThen, heightThen } = terrainMap[thash];
      const rockCycle = r - rocksThen;
      const heightDelta = h - heightThen;
      const loops = Math.floor((rocks - r) / rockCycle);
      if (loops) {
        log(
          'At',
          r,
          'repeating',
          rockCycle,
          'rocks',
          loops,
          'times, adding',
          loops * heightDelta,
          'height and',
          rockCycle * loops,
          'rocks',
        );

        /*
        const now = print(exposedRocks);
        log('Then'.padEnd(25), 'Now'.padEnd(25));
        const then = terrainMap[thash].info;
        for (let i = 0; i < Math.max(info.length, now.length); i += 1) {
          log((then[i] || '').padEnd(25), (now[i] || '').padEnd(25));
        }
        */

        r += loops * rockCycle;
        boosted = loops * heightDelta;
        log('Resuming', r, 'with', exposedRocks.length, 'rocks');
      }
    }
    terrainMap[thash] = { rocksThen: r, heightThen: h, info: print(exposedRocks) };
    if (r % 2500 === 0) {
      log(r);
    }
    exposedRocks = exposedRocks.slice(0, MAX_RELEVANT_ROCKS);
  }
  return Math.max(...exposedRocks.map((r) => r.top)) + boosted + 1;
}

describe('day 17', () => {
  test('sample data', () => {
    log('Try', rockOrder.length, sample.length);
    expect(run(sample, 2022)).toEqual(3068);
    expect(run(sample, 1000000000000)).toEqual(1514285714288);
  });

  const [data] = getLines('day17.txt');
  const p1 = run(data, 2022);
  test.todo(`Part 1: ${p1}`);
  test.todo(`Part 2: ${run(data, 1000000000000)}`);
});
