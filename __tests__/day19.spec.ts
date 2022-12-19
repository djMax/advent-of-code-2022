import { spawn, Pool, Worker } from 'threads';
import { Blueprint, getLines, log, Resource } from '../src';

const sample = `Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
Blueprint 2: Each ore robot costs 2 ore. Each clay robot costs 3 ore. Each obsidian robot costs 3 ore and 8 clay. Each geode robot costs 3 ore and 12 obsidian.`;

function parse(blueprints: string[]) {
  return blueprints.map((blueprint) => {
    const [bpIndex, spec] = blueprint.split(': ');
    const bp: Blueprint = {
      index: parseInt(bpIndex.split(' ')[1], 10),
      costs: {} as Blueprint['costs'],
    };
    spec
      .trim()
      .split('.')
      .filter((s) => s.trim())
      .forEach((s) => {
        const [, robotType, costs] = s
          .trim()
          .match(/Each (.*) robot costs (.*)/) as RegExpMatchArray;
        const cost: Record<Resource, number> = {
          ore: 0,
          clay: 0,
          obsidian: 0,
          geode: 0,
        };
        costs.split(' and ').forEach((c) => {
          const [count, resource] = c.split(' ');
          cost[resource as Resource] = parseInt(count, 10);
        });
        bp.costs[robotType as Resource] = cost;
      });
    return bp;
  });
}

async function getBest(blueprints: Blueprint[], minutes: number) {
  const pool = Pool(() => spawn(new Worker('../src/day19')));
  const results: number[] = [];
  blueprints.forEach((bp, ix) => {
    pool.queue(async (fn) => {
      const r = await fn(bp, minutes);
      results[ix] = r;
    });
  });
  await pool.completed();
  await pool.terminate();
  return results;
}

async function part1(blueprints: Blueprint[]) {
  const maxScores = await getBest(blueprints, 24);
  return maxScores.reduce((acc, s, ix) => acc + s * (ix + 1), 0);
}

async function part2(blueprints: Blueprint[]) {
  const maxScores = await getBest(blueprints.slice(0, 3), 32);
  return maxScores.reduce((acc, s) => acc * s, 1);
}

jest.setTimeout(60000);

describe('day 19', () => {
  test('sample data', async () => {
    const b = parse(sample.split('\n'));
    const p1 = await part1(b);
    expect(p1).toEqual(33);
    const p2 = await part2(b);
    expect(p2).toEqual(56 * 62);
  });

  test('real data', async () => {
    const bp = parse(getLines('day19.txt'));
    const p1 = await part1(bp);
    const p2 = await part2(bp);
    log(`Part 1 ${p1}`);
    log(`Part 2 ${p2}`);
  });
});
