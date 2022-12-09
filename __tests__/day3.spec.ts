import lodash from 'lodash';
import { getLines } from '../src/index';

interface Rucksack {
  one: string;
  two: string;
}

const sample = `vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw`;

function findSame(r: Rucksack) {
  // Find the character that is both strings
  return r.one.split('').find((c) => r.two.indexOf(c) >= 0)!;
}

function findSameInAll(sacks: string[]) {
  return lodash.intersection(...sacks.map((s) => s.split('')))[0];
}

function priority(s: string) {
  if (s.toLowerCase() !== s) {
    return s.charCodeAt(0) - 65 + 27;
  }
  return s.charCodeAt(0) - 96;
}

function scoreString(lines: string[]) {
  const sacks: Rucksack[] = lines.map((line) => ({
    one: line.slice(0, line.length / 2),
    two: line.slice(line.length / 2),
  }));

  const sames = sacks.map(findSame);
  const score = sames.map(priority);
  return score.reduce((acc, s) => acc + s, 0);
}

function scoreGroups(lines: string[]) {
  // Partition the lines into groups of 3
  return lodash
    .chunk(lines, 3)
    .map(findSameInAll)
    .map(priority)
    .reduce((acc, s) => acc + s, 0);
}

describe('day 3', () => {
  test('sample data', () => {
    expect(scoreString(sample.split('\n'))).toEqual(157);
    expect(scoreGroups(sample.split('\n'))).toEqual(70);
  });

  const lines = getLines('day3.txt');
  expect(lines).toBeTruthy();
  expect(lines.length).toBeGreaterThan(0);

  test.todo(`Part1 Result: ${scoreString(lines)}`);
  test.todo(`Part2 Result: ${scoreGroups(lines)}`);
});
