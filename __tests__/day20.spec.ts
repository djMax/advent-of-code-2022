import { getLines } from '../src';

const sample = `1
2
-3
3
-2
0
4`;

interface Value { value: number; }

function mix(original: Value[], copy: Value[]) {
  original.forEach((value) => {
    const index = copy.indexOf(value);
    // Remove
    copy.splice(index, 1);
    // Put it back - important to use the copy length because we just
    // removed one.
    copy.splice((index + value.value) % copy.length, 0, value);
  });
  return copy;
}

function part1(values: number[]) {
  const objectified = values.map((value) => ({ value }));
  const copy = mix(objectified, [...objectified]);
  const zero = copy.findIndex((v) => v.value === 0);
  return [1000, 2000, 3000]
    .map((i) => copy[(zero + i) % values.length].value)
    .reduce((acc, v) => acc + v, 0);
}

function part2(values: number[]) {
  const objectified = values.map((v) => ({ value: v * 811589153 }));
  const copy = [...objectified];
  for (let i = 0; i < 10; i += 1) {
    mix(objectified, copy);
  }
  const zero = copy.findIndex((v) => v.value === 0);
  return [1000, 2000, 3000]
    .map((i) => copy[(zero + i) % values.length].value)
    .reduce((acc, v) => acc + v, 0);
}

describe('day 20', () => {
  test('sample data', () => {
    const lines = sample.split('\n').map(Number);
    expect(part1(lines)).toEqual(3);
    expect(part2(lines)).toEqual(1623178306);
  });

  const lines = getLines('day20.txt').map(Number);
  test.todo(`Part 1 ${part1(lines)}`);
  test.todo(`Part 2 ${part2(lines)}`);
});
