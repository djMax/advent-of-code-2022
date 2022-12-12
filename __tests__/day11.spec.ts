import lodash from 'lodash';
import { getLines, log, loop } from '../src/index';

interface Monkey {
  id: number;
  items: number[];
  operation: (n: number) => number;
  divisor: number;
  ifTrue: number;
  ifFalse: number;
  inspectionCount: number;
}

const sample = `Monkey 0:
Starting items: 79, 98
Operation: new = old * 19
Test: divisible by 23
  If true: throw to monkey 2
  If false: throw to monkey 3

Monkey 1:
Starting items: 54, 65, 75, 74
Operation: new = old + 6
Test: divisible by 19
  If true: throw to monkey 2
  If false: throw to monkey 0

Monkey 2:
Starting items: 79, 60, 97
Operation: new = old * old
Test: divisible by 13
  If true: throw to monkey 1
  If false: throw to monkey 3

Monkey 3:
Starting items: 74
Operation: new = old + 3
Test: divisible by 17
  If true: throw to monkey 0
  If false: throw to monkey 1`;

function parseOp(str: string) {
  const [left, op, right] = str.split(' ');
  return (v: number) => {
    const l = left === 'old' ? v : Number(left);
    const r = right === 'old' ? v : Number(right);
    if (op === '+') {
      return l + r;
    }
    if (op === '*') {
      return l * r;
    }
    throw new Error(`Unknown op: ${op}`);
  };
}

function clamp(n: number, mod: number) {
  if (n > mod) {
    return n % mod;
  }
  return n;
}

function turn(monkeys: Monkey[], mod: number, worry: (n: number) => number) {
  monkeys.forEach((monkey) => {
    const { items } = monkey;
    monkey.items = [];
    monkey.inspectionCount += items.length;
    items.forEach((item) => {
      const newLevel = clamp(worry(monkey.operation(item)), mod);
      if (newLevel % monkey.divisor === 0) {
        monkeys[monkey.ifTrue].items.push(newLevel);
      } else {
        monkeys[monkey.ifFalse].items.push(newLevel);
      }
    });
  });
}

function readStatus(lines: string[]) {
  const monkeys: Monkey[] = lodash
    .chunk(lines, 7)
    .map(([id, items, op, testExp, ifTrue, ifFalse]) => ({
      id: parseInt(id.split(' ')[1], 10),
      items: items
        .split(': ')[1]
        .split(',')
        .map((n) => Number(n.trim())),
      // eslint-disable-next-line no-eval
      operation: parseOp(op.split('new = ')[1]),
      divisor: Number(testExp.split(' ').pop()!),
      ifTrue: parseInt(ifTrue.split('monkey ')[1], 10),
      ifFalse: parseInt(ifFalse.split('monkey ')[1], 10),
      inspectionCount: 0,
    }));
  return monkeys;
}

function runPart1(lines: string[]) {
  const monkeys = readStatus(lines);
  const mod = monkeys.reduce((acc, m) => acc * m.divisor, 1);
  loop(() => turn(monkeys, mod, (n) => Math.floor(n / 3)), 20);
  const counts = monkeys.map((m) => m.inspectionCount).sort((a, b) => b - a);
  return counts[0] * counts[1];
}

function runPart2(lines: string[]) {
  const monkeys = readStatus(lines);
  const mod = monkeys.reduce((acc, m) => acc * m.divisor, 1);
  for (let i = 1; i <= 10000; i += 1) {
    turn(monkeys, mod, (n) => n);
    /*
    if ([1, 20, 1000].includes(i)) {
      log(`Turn ${i}`);
      monkeys.forEach((m) => log(`Monkey ${m.id} (${m.inspectionCount}): ${m.items.join(',')}`));
    }
    */
  }
  const counts = monkeys.map((m) => m.inspectionCount).sort((a, b) => b - a);
  return counts[0] * counts[1];
}

describe('day 10', () => {
  test('sample data', () => {
    const monkeys = readStatus(sample.split('\n'));
    expect(monkeys.length).toEqual(4);
    expect(runPart1(sample.split('\n'))).toEqual(10605);
    expect(runPart2(sample.split('\n'))).toEqual(2713310158);
  });

  test.todo(`Part 1 Result: ${runPart1(getLines('day11.txt'))}`);
  test.todo(`Part 2 Result: ${runPart2(getLines('day11.txt'))}`);
});
