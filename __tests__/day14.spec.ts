import { getLines, log } from '../src/index';

const sample = `498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9`;

function delta(a: number, b: number) {
  if (a === b) {
    return 0;
  }
  return a > b ? -1 : 1;
}

function parseInput(lines: string[]) {
  const blocks = new Set<string>();
  let abyss = 0;
  lines.forEach((line) => {
    const segments = line.split(' -> ').map((s) => s.split(',').map((n) => Number(n)));
    for (let i = 1; i < segments.length; i += 1) {
      const [x1, y1] = segments[i - 1];
      const [x2, y2] = segments[i];
      const [dx, dy] = [delta(x1, x2), delta(y1, y2)];
      abyss = Math.max(abyss, y1, y2);
      const length = Math.abs(x1 - x2) + Math.abs(y1 - y2);
      // log(segments[i - 1], segments[i], 'Len', length, '∆', dx, dy);
      for (let j = 0; j <= length; j += 1) {
        blocks.add(`${x1 + j * dx},${y1 + j * dy}`);
      }
    }
  });
  return { blocks, abyss: abyss + 1 };
}

function nextFromPoint(blocks: Set<string>, sand: Set<string>, point: number[]) {
  return [
    `${point[0]},${point[1] + 1}`,
    `${point[0] - 1},${point[1] + 1}`,
    `${point[0] + 1},${point[1] + 1}`,
  ].find((p) => !blocks.has(p) && !sand.has(p));
}

function pourSand(blocks: Set<string>, abyss: number, hasFloor = false) {
  const sand = new Set<string>();
  let iterations = 0;
  while (!sand.has('500,0')) {
    let point = [500, 0];
    while (point[1] <= abyss) {
      const next = nextFromPoint(blocks, sand, point);
      if (next) {
        point = next.split(',').map((n) => Number(n));
      } else {
        // log(iterations, 'at rest', point);
        sand.add(point.join(','));
        break;
      }
    }
    if (point[1] > abyss) {
      if (!hasFloor) {
        return iterations;
      }
      // log(iterations, 'at floor', point);
      sand.add(point.join(','));
    } else {
      iterations += 1;
    }
  }
  return iterations;
}

describe('day 14', () => {
  test('sample data', () => {
    const { blocks, abyss } = parseInput(sample.split('\n'));
    expect(blocks.size).toEqual(20);
    const sandCount = pourSand(blocks, abyss);
    expect(sandCount).toEqual(24);
    const sand2 = pourSand(blocks, abyss, true);
    expect(sand2).toEqual(93);
  });

  const { blocks, abyss } = parseInput(getLines('day14.txt'));
  test.todo(`Part 1 result ${pourSand(blocks, abyss)}`);
  test.todo(`Part 2 result ${pourSand(blocks, abyss, true)}`);
});
