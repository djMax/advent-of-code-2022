import { getFile, log, time } from '../index';
import { MatrixBoard } from '../MatrixBoard';
import { Point } from '../Point';
import { Cardinal, CardinalCombo } from '../types';

enum Contents {
  Elf = '#',
  Space = '.',
}

type ElfBoard = Set<string>;

function hasElf(board: ElfBoard, elf: Point, ...directions: CardinalCombo[]) {
  return directions.some((dir) => {
    const pt = elf.move(dir);
    return board.has(pt.toString());
  });
}

interface Rule {
  dir: Cardinal;
  test: (board: ElfBoard, elf: Point) => boolean;
}

const RULES: Rule[] = [
  { dir: 'N', test: (board, p) => !hasElf(board, p, 'N', 'NE', 'NW') },
  { dir: 'S', test: (board, p) => !hasElf(board, p, 'S', 'SE', 'SW') },
  { dir: 'W', test: (board, p) => !hasElf(board, p, 'W', 'NW', 'SW') },
  { dir: 'E', test: (board, p) => !hasElf(board, p, 'E', 'NE', 'SE') },
];

function propose(board: ElfBoard, elf: Point, mod: number): Cardinal | undefined {
  if (!hasElf(board, elf, 'N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW')) {
    // No elf around us, we do not move
    return undefined;
  }

  for (let i = 0; i < 4; i += 1) {
    const rule = RULES[(i + mod) % 4];
    if (rule.test(board, elf)) {
      return rule.dir;
    }
  }
  return undefined;
}

function round(board: ElfBoard, elves: Point[], mod: number) {
  const proposed = elves
    .map((elf) => propose(board, elf, mod))
    .map((dir, ix) => dir && elves[ix].move(dir));

  let moves = 0;
  const updatedElves = proposed.map((p, ix) => {
    if (p && !proposed.some((p2) => p !== p2 && p.eq(p2))) {
      moves += 1;
      board.delete(elves[ix].toString());
      board.add(p.toString());
      return p;
    }
    return elves[ix];
  });

  return { moves, elves: updatedElves };
}

function scorePart1(board: ElfBoard) {
  const {
    e, w, n, s,
  } = Point.bounds(Array.from(board).map((ps) => new Point(ps)));
  return (e - w + 1) * (s - n + 1) - board.size;
}

function run(initial: MatrixBoard<Contents>, rounds: number) {
  const board = initial.toSet((v) => v === Contents.Elf);
  let mod = -1;

  let remaining = rounds;
  let elves = Array.from(board).map((ps) => new Point(ps));
  let moves = -1;

  while (moves && remaining > 0) {
    mod = (mod + 1) % 4;
    ({ moves, elves } = round(board, elves, mod));
    remaining -= 1;
  }

  return { score: scorePart1(board), rounds: rounds - remaining };
}

function part1(initial: MatrixBoard<Contents>) {
  return run(initial, 10).score;
}

function part2(initial: MatrixBoard<Contents>) {
  return run(initial, Number.MAX_SAFE_INTEGER).rounds;
}

function parse(input: string) {
  return MatrixBoard.read(input, (c) => (c === '#' ? Contents.Elf : Contents.Space));
}

export default {
  part1,
  part2,
  parse,
};

if (typeof module === 'undefined' || require.main === module) {
  const board = parse(getFile('./data/day23.txt'));
  log(
    'Part 1',
    time(() => part1(board)),
  );
  log(
    'Part 2',
    time(() => part2(board)),
  );
}
