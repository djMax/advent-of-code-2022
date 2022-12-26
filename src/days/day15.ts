import { getFile, log, time } from '../index';
import { Point } from '../Point';

interface Sensor {
  position: Point;
  beacon: Point;
  distance: number;
}

type Item = 'S' | 'B' | '#' | '.';

function parse(input: string) {
  const sensors = input.split('\n').map((l) => {
    const m = l.match(/x=(\d+), y=(\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)!;
    const position = new Point(Number(m[1]), Number(m[2]));
    const beacon = new Point(Number(m[3]), Number(m[4]));
    return {
      position,
      beacon,
      distance: Point.manhattanDistance(position, beacon),
    };
  }) as Sensor[];
  const minX = Math.min(
    ...sensors.map((s) => {
      const distance = Point.manhattanDistance(s.position, s.beacon);
      return Math.min(s.position.x, s.beacon.x, s.position.x - distance);
    }),
  );
  const maxX = Math.max(
    ...sensors.map((s) => {
      const distance = Point.manhattanDistance(s.position, s.beacon);
      return Math.max(s.position.x, s.beacon.x, s.position.x + distance);
    }),
  );
  const offsetX = minX < 0 ? -minX : 0;
  return {
    sensors, minX, maxX, offsetX,
  };
}

function eliminate(row: Item[], x: number) {
  const existing = row[x];
  if (existing === '#' || existing === 'S') {
    return;
  }
  // If there is a beacon there, it was a tie, so we don't eliminate it.
  if (existing !== 'B') {
    row[x] = '#';
  }
}

function computeRow(sensors: Sensor[], rowContents: Item[], offsetX: number, row: number) {
  sensors.forEach((s) => {
    const {
      beacon: { x: bx, y: by },
      position: { x, y },
      distance,
    } = s;
    if (y === row) {
      rowContents[offsetX + x] = 'S';
    }
    // See if the range of this beacon matters for our row.
    // Ends before we care?
    if (y < row && y + distance < row) {
      // log('Ends before we care', row, x, y, bx, by);
      return;
    }
    // Starts after we care?
    if (y > row && y - distance > row) {
      // log('Starts after we care', row, x, y, bx, by);
      return;
    }
    // We care.
    // log('S', row, s.position, s.beacon, 'Beacon', s.beacon, 'dist', distance);
    const maxD = distance - Point.manhattanDistance(s.position, new Point(s.position.x, row));
    // manhattan(s.position, [x + d, row]) <= distance
    for (let d = 0; d <= maxD; d += 1) {
      // log('Eliminate', x + d, 'and', x - d, 'dist', manhattan(s.position, [x + d, row]));
      eliminate(rowContents, offsetX + x + d);
      eliminate(rowContents, offsetX + x - d);
    }
    if (by === row) {
      rowContents[offsetX + bx] = 'B';
    }
  });
}

function getRowStats(sensors: Sensor[], offsetX: number, maxX: number, row: number) {
  const rowContents = Array(offsetX + maxX + 1).fill('.') as Item[];
  computeRow(sensors, rowContents, offsetX, row);
  return rowContents;
}

function sign(x: number) {
  if (x === 0) {
    return 0;
  }
  return x < 0 ? -1 : 1;
}

function findMissingBeacon(sensors: Sensor[]) {
  // So the insight that matters here is that the beacon must lie at a point
  // that is precisely between two sensor's ranges. Something like S####*####S
  // (but in 2d of course). So let's find all these pairs.
  const inc = new Set<number>();
  const dec = new Set<number>();

  sensors.forEach((s, ix) => {
    sensors.slice(ix + 1).forEach((s2) => {
      const { x: x1, y: y1 } = s.position;
      const { x: x2, y: y2 } = s2.position;
      const d1 = s.distance;
      const d2 = s2.distance;
      // Two units is one 'spot' away via manhattan distance.
      if (Point.manhattanDistance(s.position, s2.position) === d1 + d2 + 2) {
        if (sign(x1 - x2) === sign(y1 - y2)) {
          const xy1 = x1 + y1;
          const xy2 = x2 + y2;
          dec.add(xy1 + sign(xy2 - xy1) * (d1 + 1));
        } else {
          const yx1 = y1 - x1;
          const yx2 = y2 - x2;
          inc.add(yx1 + sign(yx2 - yx1) * (d1 + 1));
        }
      }
    });
  });

  let tuningFrequency = 0;
  inc.forEach((I) => {
    dec.forEach((D) => {
      if (tuningFrequency) {
        return;
      }
      const x = (D - I) / 2;
      const y = (D + I) / 2;
      if (x !== Math.floor(x)) {
        return;
      }
      // If this candidate is not within the blast radius of any sensor, it's the one.
      if (!sensors.find((s) => Point.manhattanDistance(s.position, new Point(x, y)) < s.distance)) {
        tuningFrequency = x * 4000000 + y;
      }
    });
  });
  return tuningFrequency;
}

function part1({ sensors, maxX, offsetX }: ReturnType<typeof parse>, row: number) {
  const rowContent = getRowStats(sensors, maxX, offsetX, row);
  return rowContent.filter((f) => f === '#').length;
}

function part2({ sensors }: ReturnType<typeof parse>) {
  return findMissingBeacon(sensors);
}

if (typeof module === 'undefined' || require.main === module) {
  const input = getFile('data/day15.txt');
  const parsed = parse(input);
  log(`Part 1: ${time(() => part1(parsed, 2000000))}`);
  log(`Part 2: ${time(() => part2(parsed))}`);
}

export default {
  parse,
  part1,
  part2,
};
