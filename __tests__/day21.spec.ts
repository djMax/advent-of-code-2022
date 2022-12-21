import { getLines } from '../src';

const sample = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`;

const FNS = {
  '*': (a: number, b: number) => a * b,
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '/': (a: number, b: number) => a / b,
} as const;

const INVERTED = {
  '*': FNS['/'],
  '+': FNS['-'],
  '-': FNS['+'],
  '/': FNS['*'],
};

interface Monkey {
  name: string;
  type: 'simple' | 'dependent';
  value?: number;
}

interface DependentMonkey extends Monkey {
  type: 'dependent';
  a: string;
  b: string;
  op: keyof typeof FNS;
}

function parse(lines: string[]) {
  const byName: Record<string, Monkey> = {};
  const nodes: Monkey[] = lines.map((line) => {
    const [nameColon, a, op, b] = line.split(' ');
    const name = nameColon.slice(0, -1);
    if (!Number.isNaN(Number(a))) {
      return { type: 'simple', name, value: Number(a) };
    }
    return {
      name,
      type: 'dependent',
      a,
      b,
      op: op as keyof typeof FNS,
    };
  });
  nodes.forEach((n) => {
    byName[n.name] = n;
  });
  const opNodes = nodes.filter((n) => n.type === 'dependent') as DependentMonkey[];
  return { byName, nodes, opNodes };
}

function part1(lines: string[]) {
  const { byName, opNodes } = parse(lines);
  while (byName.root.value === undefined) {
    opNodes.forEach((node) => {
      if (node.value === undefined) {
        const [a, b] = [byName[node.a].value, byName[node.b].value];
        if (a !== undefined && b !== undefined) {
          node.value = FNS[node.op!](a, b);
        }
      }
    });
  }
  return byName.root.value;
}

// This assumes (and throws if not) that there is a single path backwards... Turns out to be true
function backProp(byName: Record<string, Monkey>, name: string) {
  const start = byName[name];
  if (start.type !== 'dependent') {
    throw new Error('Invalid node to back propagate from');
  }
  let node: DependentMonkey | undefined = start as DependentMonkey;
  const operation: ((v: number) => number)[] = [];
  while (node && node.name !== 'humn') {
    const [a, b] = [byName[node.a].value, byName[node.b].value];
    if (node.op === '-' && a !== undefined) {
      // Special case where we are dependent on the subtrahend
      operation.push((v: number) => FNS['-'](a, v));
    } else {
      const op = INVERTED[node.op];
      operation.push((v: number) => op(v, a || b || 0));
    }
    node = byName[a === undefined ? node.a : node.b] as DependentMonkey;
  }
  return operation;
}

function part2(lines: string[]) {
  const { byName, opNodes } = parse(lines);
  // Don't resolve human or dependencies of human
  byName.humn.value = undefined;
  let resolved = 0;
  do {
    resolved = opNodes.filter((node) => {
      if (node.value === undefined && node.name !== 'humn') {
        const [a, b] = [byName[node.a].value, byName[node.b].value];
        if (a !== undefined && b !== undefined) {
          node.value = FNS[node.op](a, b);
          return true;
        }
      }
      return false;
    }).length;
  } while (resolved);

  const root = byName.root as DependentMonkey;
  const [rootA, rootB] = [byName[root.a].value, byName[root.b].value];
  const target = rootA || rootB || 0;
  // Rely on at least ONE branch to be resolved
  if (byName[root.a].value === undefined && byName[root.b].value === undefined) {
    throw new Error('Cannot resolve root');
  }
  const ops = backProp(byName, rootA === undefined ? root.a : root.b);
  return ops.reduce((acc, op) => op(acc), target);
}

describe('day 21', () => {
  test('sample data', () => {
    const lines = sample.split('\n');
    expect(part1(lines)).toEqual(152);
    expect(part2(lines)).toEqual(301);
  });

  const lines = getLines('day21.txt');
  test.todo(`Part 1 ${part1(lines)}`);
  test.todo(`Part 2 ${part2(lines)}`);
});
