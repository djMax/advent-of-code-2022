import { getLines, log } from '../index';

const CHARS: Record<string, number> = {
  2: 2,
  1: 1,
  0: 0,
  '-': -1,
  '=': -2,
};

function toDecimal(snafu: string) {
  return snafu.split('').reverse().reduce((acc, c, i) => {
    const v = CHARS[c];
    return acc + (v * 5 ** i);
  }, 0);
}

function toSnafu(decimal: number) {
  const base5 = Number(decimal).toString(5);
  const digits = base5.split('').map(Number);
  let borrow = digits.findIndex((n) => n > 2);
  while (borrow !== -1) {
    digits[borrow] -= 5;
    if (borrow === 0) {
      digits.unshift(1);
    } else {
      digits[borrow - 1] += 1;
    }
    borrow = digits.findIndex((n) => n > 2);
  }
  return digits.map((n) => {
    switch (n) {
      case -1:
        return '-';
      case -2:
        return '=';
      default:
        return String(n);
    }
  }).join('');
}

function part1(l: string[]) {
  return toSnafu(l.map(toDecimal).reduce((acc, n) => acc + n, 0));
}

function part2(l: string[]) {
  return l.length;
}

if (typeof module === 'undefined' || require.main === module) {
  const lines = getLines('day25.txt');
  log(`Part 1: ${part1(lines)}`);
}

export default {
  part1,
  part2,
};
