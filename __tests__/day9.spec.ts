import { getLines, log, printPositions } from '../src';

const sample = `R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2`;

const sample2 = `R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`;

type Direction = 'R' | 'L' | 'U' | 'D';
const Deltas = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};

function updateTail(head: number[], tail: number[]) {
  const dx = head[0] > tail[0] ? 1 : -1;
  const dy = head[1] > tail[1] ? 1 : -1;
  const distx = Math.abs(head[0] - tail[0]);
  const disty = Math.abs(head[1] - tail[1]);

  if (distx && disty && (distx > 1 || disty > 1)) {
    const newTail = [tail[0] + dx, tail[1] + dy];
    // log('Head', head, 'move tail xy', tail, newTail);
    return newTail;
  }
  if (distx > 1) {
    const newTail = [tail[0] + dx, tail[1]];
    // log('Head', head, 'move tail x', tail, newTail);
    return newTail;
  }
  if (disty > 1) {
    const newTail = [tail[0], tail[1] + dy];
    // log('Head', head, 'move tail y', tail, newTail);
    return newTail;
  }
  // log('Head', head, 'tail stays', tail);
  return tail;
}

function runSingleTail(spec: string[]) {
  const head = [0, 0];
  let tail = [0, 0];
  const visited = new Set<string>(['0,0']);
  spec.forEach((line) => {
    const [dir, count] = line.split(' ');
    const [dx, dy] = Deltas[dir as Direction];
    for (let i = 0; i < parseInt(count, 10); i += 1) {
      head[0] += dx;
      head[1] += dy;
      tail = updateTail(head, tail);
      visited.add(tail.join(','));
    }
  });
  return visited.size;
}

function runMultiTail(spec: string[], tailCount = 9) {
  const positions = Array(tailCount + 1)
    .fill(0)
    .map(() => [0, 0]);
  const visited = new Set<string>(['0,0']);
  spec.forEach((line) => {
    const [dir, count] = line.split(' ');
    const [dx, dy] = Deltas[dir as Direction];
    for (let i = 0; i < parseInt(count, 10); i += 1) {
      positions.forEach((pos, ix) => {
        if (ix === 0) {
          pos[0] += dx;
          pos[1] += dy;
        } else {
          [pos[0], pos[1]] = updateTail(positions[ix - 1], pos);
          if (ix === tailCount) {
            visited.add(pos.join(','));
          }
        }
      });
    }
    // log(`\n\n${dir}`, count);
    // printPositions(positions);
  });
  return visited.size;
}

describe('day 9', () => {
  test('sample data', () => {
    expect(runSingleTail(sample.split('\n'))).toBe(13);
    expect(runMultiTail(sample.split('\n'))).toBe(1);
    expect(runMultiTail(sample2.split('\n'))).toBe(36);
  });

  test.todo(`Part 1 result: ${runSingleTail(getLines('day9.txt'))}`);
  test.todo(`Part 2 result: ${runMultiTail(getLines('day9.txt'))}`);
});
