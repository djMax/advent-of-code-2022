import lodash from 'lodash';
import { getLines, log } from '../src/index';

const sample = `[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]`;

type ElementType = number | ElementType[];
type Pair = [ElementType, ElementType];

function parseLine(l: string) {
  const stack = [] as ElementType[][];
  const split = l.split('');
  for (let i = 0; i < split.length; i += 1) {
    switch (split[i]) {
      case '[':
        {
          const newArray = [] as ElementType[];
          if (stack.length) {
            stack[stack.length - 1].push(newArray);
          }
          stack.push(newArray);
        }
        break;
      case ']':
        if (stack.length === 1) {
          return stack[0];
        }
        stack.pop();
        break;
      case ',':
        break;
      default:
        {
          let val = 0;
          while (split[i]?.match(/\d/)) {
            val = val * 10 + parseInt(split[i], 10);
            i += 1;
          }
          stack[stack.length - 1].push(val);
          // Be kind, rewind
          i -= 1;
        }
        break;
    }
  }
  throw new Error('Invalid input');
}

function parse(lines: string[]): Pair[] {
  return lodash.chunk(lines, 3).map(([p1, p2]) => [parseLine(p1), parseLine(p2)]);
}

function compare(left: ElementType, right: ElementType): number {
  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < left.length && i < right.length; i += 1) {
      const result = compare(left[i], right[i]);
      if (result !== 0) {
        return result;
      }
    }
    if (left.length !== right.length) {
      return left.length - right.length;
    }
    return 0;
  }
  if (Array.isArray(left)) {
    return compare(left, [right]);
  }
  if (Array.isArray(right)) {
    return compare([left], right);
  }
  return left - right;
}

function runPart1(lines: string[]) {
  const matches = parse(lines);
  return matches.reduce(
    (sum, [left, right], ix) => (compare(left, right) < 0 ? sum + ix + 1 : sum),
    0,
  );
}

function findDecoderPacket(arr: ElementType[], val: number) {
  return arr.findIndex(
    (e) =>
      Array.isArray(e) &&
      Array.isArray(e[0]) &&
      e[0][0] === val &&
      e.length === 1 &&
      e[0].length === 1,
  );
}

function runPart2(lines: string[]) {
  const matches = parse(lines);
  const flat = matches.reduce((arr, [l1, l2]) => [...arr, l1, l2], [] as ElementType[]);
  flat.push(parseLine('[[2]]'));
  flat.push(parseLine('[[6]]'));
  flat.sort(compare);
  // flat.forEach((f) => log(JSON.stringify(f)));
  const decoder1 = findDecoderPacket(flat, 2) + 1;
  const decoder2 = findDecoderPacket(flat, 6) + 1;
  return decoder1 * decoder2;
}

describe('day 13', () => {
  test('sample data', () => {
    const matches = parse(sample.split('\n'));
    expect(matches.length).toEqual(8);
    expect(compare(matches[0][0], matches[0][1])).toBeLessThan(0);
    expect(compare(matches[1][0], matches[1][1])).toBeLessThan(0);
    expect(compare(matches[2][0], matches[2][1])).toBeGreaterThan(0);
    expect(compare(matches[3][0], matches[3][1])).toBeLessThan(0);
    expect(compare(matches[4][0], matches[4][1])).toBeGreaterThan(0);
    expect(compare(matches[5][0], matches[5][1])).toBeLessThan(0);
    expect(compare(matches[6][0], matches[6][1])).toBeGreaterThan(0);
    expect(compare(matches[7][0], matches[7][1])).toBeGreaterThan(0);
    expect(runPart1(sample.split('\n'))).toEqual(13);
    expect(runPart2(sample.split('\n'))).toEqual(140);
  });

  test.todo(`Part 1 Result ${runPart1(getLines('day13.txt'))}`);
  test.todo(`Part 2 Result ${runPart2(getLines('day13.txt'))}`);
});
