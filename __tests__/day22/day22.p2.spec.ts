import { getFile } from '../../src';
import { DELTAS, parse, score, turn } from './board';
import { Contents, Heading, PosDir, Position } from './types';

type WrapRule = [Position, (p: Position) => [Position, Heading]];

const Inf = Infinity;

const WrappingRules: WrapRule[][] = [
  [
    // R
    [[Inf, 50], ([, y]) => [[99, 149 - y], Heading.Left]],
    [[Inf, 100], ([, y]) => [[y + 50, 49], Heading.Up]],
    [[Inf, 150], ([, y]) => [[149, 149 - y], Heading.Left]],
    [[Inf, 200], ([, y]) => [[y - 100, 149], Heading.Up]],
  ],
  [
    // D
    [[50, Inf], ([x]) => [[x + 100, 0], Heading.Down]],
    [[100, Inf], ([x]) => [[49, x + 100], Heading.Left]],
    [[150, Inf], ([x]) => [[99, x - 50], Heading.Left]],
  ],
  [
    // L
    [[Inf, 50], ([, y]) => [[0, 149 - y], Heading.Right]],
    [[Inf, 100], ([, y]) => [[y - 50, 100], Heading.Down]],
    [[Inf, 150], ([, y]) => [[50, 149 - y], Heading.Right]],
    [[Inf, 200], ([, y]) => [[y - 100, 0], Heading.Down]],
  ],
  [
    // U
    [[50, Inf], ([x]) => [[50, x + 50], Heading.Right]],
    [[100, Inf], ([x]) => [[0, x + 100], Heading.Right]],
    [[150, Inf], ([x]) => [[x - 100, 199], Heading.Up]],
  ],
];

function walkCube({ board, moves, start }: ReturnType<typeof parse>): {
  heading: Heading;
  position: Position;
} {
  return moves.reduce((acc, instruction) => {
    let { position: p, heading } = acc;
    const ruleFinder = ([b]: WrapRule) => p.every((c2, i) => c2 < b[i]);
    let { steps } = instruction;
    let facing = heading;
    let pos: Position;

    while (board[p[1]]?.[p[0]] !== Contents.Wall && steps >= 0) {
      const c = board[p[1]]?.[p[0]];
      if (c === Contents.Available) {
        pos = p;
        facing = heading;
        steps -= 1;
        p = [DELTAS[heading][0] + p[0], DELTAS[heading][1] + p[1]];
      } else {
        const wrapRule = WrappingRules[facing]!;
        [p, heading] = wrapRule.find(ruleFinder)![1](p);
      }
    }

    return { position: pos!, heading: turn(facing, instruction.direction) };
  }, { position: start, heading: Heading.Right } as PosDir);
}

describe('day 22, part 2', () => {
  const p = parse(getFile('data/day22.txt'));
  const final = walkCube(p);
  test.todo(`Part 2: ${score(final.position, final.heading)}`);
});
