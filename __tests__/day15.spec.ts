import { getLines } from '../src';

const sample = `Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3`;

function manhattan(p1: [number, number], p2: [number, number]) {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

interface Sensor {
  position: [number, number];
  beacon: [number, number];
  distance: number;
}

type Item = 'S' | 'B' | '#' | '.';

function parseBeacons(lines: string[]) {
  const sensors = lines.map((l) => {
    const m = l.match(/x=(\d+), y=(\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/)!;
    return {
      position: [Number(m[1]), Number(m[2])],
      beacon: [Number(m[3]), Number(m[4])],
      distance: manhattan([Number(m[1]), Number(m[2])], [Number(m[3]), Number(m[4])]),
    };
  }) as Sensor[];
  const minX = Math.min(
    ...sensors.map((s) => {
      const distance = manhattan(s.position, s.beacon);
      return Math.min(s.position[0], s.beacon[0], s.position[0] - distance);
    }),
  );
  const maxX = Math.max(
    ...sensors.map((s) => {
      const distance = manhattan(s.position, s.beacon);
      return Math.max(s.position[0], s.beacon[0], s.position[0] + distance);
    }),
  );
  const offsetX = minX < 0 ? -minX : 0;
  return { sensors, minX, maxX, offsetX };
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
      beacon: [bx, by],
      position: [x, y],
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
    const maxD = distance - manhattan(s.position, [s.position[0], row]);
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

function findMissingBeacon(sensors: Sensor[], maxX: number, offsetX: number, searchSpace: number) {
  // So the insight that matters here is that the beacon must lie at a point
  // that is precisely between two sensor's ranges. Something like S####*####S
  // (but in 2d of course). So let's find all these pairs.
  const inc = new Set<number>();
  const dec = new Set<number>();

  sensors.forEach((s, ix) => {
    sensors.slice(ix + 1).forEach((s2) => {
      const [x1, y1] = s.position;
      const [x2, y2] = s2.position;
      const d1 = s.distance;
      const d2 = s2.distance;
      // Two units is one 'spot' away via manhattan distance.
      if (manhattan(s.position, s2.position) === d1 + d2 + 2) {
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
      if (!sensors.find((s) => manhattan(s.position, [x, y]) < s.distance)) {
        tuningFrequency = x * 4000000 + y;
      }
    });
  });
  return tuningFrequency;
}

describe('day 15', () => {
  test('sample data', () => {
    const { sensors, maxX, offsetX } = parseBeacons(sample.split('\n'));
    expect(sensors.length).toEqual(14);
    expect(getRowStats(sensors, maxX, offsetX, 10).filter((f) => f === '#').length).toEqual(26);
    expect(findMissingBeacon(sensors, maxX, offsetX, 20)).toEqual(56000011);
    /*
    const rows = [];
    for (let i = -2; i <= 22; i += 1) {
      rows.push(getRowStats(sample.split('\n'), i).join(''));
    }
    rows.forEach((r, i) => {
      log(String(i - 2).padEnd(4), r, r.split('').filter((f) => f === '#').length);
    });
    */
  });

  const { sensors, maxX, offsetX } = parseBeacons(getLines('day15.txt'));
  const row = getRowStats(sensors, maxX, offsetX, 2000000);
  test.todo(`Part 1: ${row.filter((f) => f === '#').length}`);
  const m = findMissingBeacon(sensors, maxX, offsetX, 4000000);
  test.todo(`Part 2: ${m}`);
});
