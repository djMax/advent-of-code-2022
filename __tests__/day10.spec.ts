import { getLines, log } from '../src';

interface VmState {
  X: number;
  cycles: number;
  delayed: number[];
  strengthSum: number;
  screen: string[];
}

const sample = `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop`;

const STARTING_STATE: VmState = {
  X: 1,
  cycles: 0,
  delayed: [0, 0],
  strengthSum: 0,
  screen: [''],
};

function runInstruction(vm: VmState, strengthPoints: number[], instr?: string, val?: string) {
  const X = vm.X + (vm.delayed[0] ? vm.delayed[0] : 0);
  const screen = [...vm.screen];
  const currentLine = screen[screen.length - 1];
  screen[screen.length - 1] += Math.abs(X - currentLine.length) < 2 ? '#' : '.';
  if (screen[screen.length - 1].length === 40) {
    screen.push('');
  }
  const delayed = vm.delayed.slice(1);
  if (instr === 'addx') {
    delayed[1] = (delayed[1] || 0) + parseInt(val || '0', 10);
  }
  return {
    cycles: vm.cycles + 1,
    X,
    delayed,
    strengthSum: vm.strengthSum + (strengthPoints.includes(vm.cycles) ? vm.cycles * vm.X : 0),
    screen,
  };
}

function runVm(
  lines: string[],
  count = lines.length,
  initialVm = STARTING_STATE,
  strengths: number[] = [20, 60, 100, 140, 180, 220],
) {
  const instructions = lines.map((l) => l.split(' '));
  let vm = initialVm;
  while (vm.cycles <= count) {
    const [instr, val] = instructions.shift() || [];
    vm = runInstruction(vm, strengths, instr, val);
    // log(vm);
    if (instr === 'addx') {
      vm = runInstruction(vm, strengths, 'noop');
      // log(vm);
    }
  }
  return vm;
}

describe('day 10', () => {
  test('sample data', () => {
    const output = runVm(sample.split('\n'), 239);
    expect(output.strengthSum).toEqual(13140);
    expect(output.screen.join('\n').trim()).toEqual(`##..##..##..##..##..##..##..##..##..##..
###...###...###...###...###...###...###.
####....####....####....####....####....
#####.....#####.....#####.....#####.....
######......######......######......####
#######.......#######.......#######.....`);
  });

  const output = runVm(getLines('day10.txt'), 239);
  test.todo(`Part 1 Result: ${output.strengthSum}}`);
  test.todo(`Part 2 Result:
${output.screen.join('\n').trim()}}`);
});
