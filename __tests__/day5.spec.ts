import { getLines } from '../src/index';

interface Instruction {
  count: number;
  from: number;
  to: number;
}

interface Board {
  stacks: string[][];
  instructions: Instruction[];
}

const sample = `    [D]
[N] [C]
[Z] [M] [P]
 1   2   3

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2`;

function parseBoard(spec: string[]) {
  const board: Board = {
    stacks: [],
    instructions: [],
  };
  spec.forEach((line) => {
    const move = line.match(/move (\d+) from (\d+) to (\d+)/);
    if (move) {
      board.instructions.push({
        count: parseInt(move[1], 10),
        from: parseInt(move[2], 10),
        to: parseInt(move[3], 10),
      });
    } else if (line.includes('[')) {
      for (let i = 0; i < Math.ceil(line.length / 4); i += 1) {
        const item = line[i * 4 + 1];
        if (item.trim()) {
          board.stacks[i] = board.stacks[i] || [];
          board.stacks[i].unshift(item);
        }
      }
    }
  });
  return board;
}

function moveOneAtATime(stacks: string[][], count: number, from: number, to: number) {
  const item = stacks[from - 1].pop();
  stacks[to - 1].push(item!);
  if (count > 1) {
    moveOneAtATime(stacks, count - 1, from, to);
  }
}

function moveAllAtOnce(stacks: string[][], count: number, from: number, to: number) {
  const items = stacks[from - 1].splice(stacks[from - 1].length - count);
  stacks[to - 1].push(...items);
}

function runPart1(spec: string[]) {
  const parsed = parseBoard(spec);
  parsed.instructions.forEach((i) => moveOneAtATime(parsed.stacks, i.count, i.from, i.to));
  return parsed.stacks.map((s) => s.pop()).filter((s) => s).join('');
}

function runPart2(spec: string[]) {
  const parsed = parseBoard(spec);
  parsed.instructions.forEach((i) => moveAllAtOnce(parsed.stacks, i.count, i.from, i.to));
  return parsed.stacks.map((s) => s.pop()).filter((s) => s).join('');
}

describe('day 5', () => {
  test('sample data', () => {
    const lines = sample.split('\n');
    expect(runPart1(lines)).toEqual('CMZ');
    expect(runPart2(lines)).toEqual('MCD');
  });
  const lines = getLines('day5.txt');
  test.todo(`Part 1 Result: ${runPart1(lines)}`);
  test.todo(`Part 2 Result: ${runPart2(lines)}`);
});
