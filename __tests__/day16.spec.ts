import { getLines } from '../src/index';

const sample = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`;

const RE = /Valve ([A-Z]{2}) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;

interface Valve {
  name: string;
  open: boolean;
  flow: number;
  tunnels: string[];
}

function parse(lines: string[]): Record<string, Valve> {
  const edges = lines
    .map((l) => l.match(RE)!)
    .map(([, name, flow, t]: RegExpMatchArray) => ({
      name,
      flow: Number(flow),
      open: false,
      tunnels: t.split(',').map((s) => s.trim()),
    }));
  return edges.reduce((acc, cur) => {
    acc[cur.name] = cur;
    return acc;
  }, {} as Record<string, Valve>);
}

function evaluatePath(valves: Record<string, any>, path: string[]) {
  const vCopy = Object.values(valves).reduce((acc, v) => {
    acc[v.name] = { ...v };
    return acc;
  }, {} as Record<string, Valve>) as Record<string, Valve>;

  let currentValve = vCopy.AA;
  const path30 = [...path];
  while (path30.length < 30) {
    path30.push('');
  }
  return path30.reduce((released, valve) => {
    const newFlow = Object.values(vCopy)
      .filter((v) => v.open)
      .reduce((acc, v) => acc + v.flow, 0);
    if (valve === '**') {
      currentValve.open = true;
    }
    currentValve = vCopy[valve] || currentValve;
    return released + newFlow;
  }, 0);
}

function buildPathMap(valves: Record<string, Valve>): Record<string, string> {
  const map = {} as Record<string, string>;
  const walk = (start: Valve, v: Valve, p: string) => {
    v.tunnels.forEach((v2) => {
      const k = `${start.name}${v2}`;
      const exVal = map[k];
      if (exVal && exVal.length < p.length) {
        return;
      }
      const path = `${p}${v2}`;
      map[k] = path;
      walk(start, valves[v2], path);
    });
  };
  Object.values(valves).forEach((v) => walk(v, v, v.name));
  return map;
}

function getPressurePaths(valves: Record<string, Valve>, minutes: number) {
  const usefulNodes = Object.values(valves)
    .filter((v) => v.flow > 0)
    .map((v) => v.name);
  const map = buildPathMap(valves);
  const candidates = [
    {
      actions: 'AA',
      position: 'AA',
      order: [] as string[],
      targets: usefulNodes,
      time: minutes,
      released: 0,
    },
  ];

  function addValueAndCandidates(candidate: typeof candidates[number], target: string) {
    const travel = map[`${candidate.position}${target}`];
    const toGetThere = travel.length / 2 - 1;
    // n steps to get there and 1 more to open the valve
    const time = candidate.time - toGetThere - 1;
    const value = time * valves[target].flow;
    candidates.push({
      actions: `${candidate.actions}${travel.substring(2)}**`,
      position: target,
      targets: candidate.targets.filter((t) => t !== target),
      time,
      order: [...candidate.order, target],
      released: candidate.released + value,
    });
  }

  for (let c = 0; c < candidates.length; c += 1) {
    const { time, targets, position } = candidates[c];
    if (time > 0) {
      const moves = targets.filter((target) => {
        if (target === position) {
          return false;
        }
        const dist = (map[`${position}${target}`]?.length || Number.MAX_SAFE_INTEGER) / 2 - 1;
        if (time < dist) {
          return false;
        }
        return true;
      });
      if (!moves.length) {
        candidates[c].time = 0;
      } else {
        moves.forEach((t) => addValueAndCandidates(candidates[c], t));
      }
    }
  }

  return candidates.sort((a, b) => b.released - a.released);
}

function maxPressure(valves: Record<string, Valve>, minutes: number) {
  const paths = getPressurePaths(valves, minutes);
  return paths.filter((c) => c.time === 0)[0];
}

type Result = ReturnType<typeof maxPressure>;

function findBestPair(valves: Record<string, Valve>, paths: Result[]) {
  const activeValves = Object.values(valves)
    .filter((v) => v.flow > 0)
    .map((v) => v.name);
  let bestTotal = 0;

  const map: Record<string, Result[]> = {};
  paths.forEach((p) => {
    const path = [...p.order].sort().join('');
    map[path] = map[path] || [];
    map[path].push(p);
  });

  const check = (path: Result, complement: string) => {
    if (map[complement]) {
      const releases = map[complement].filter((p2) => path !== p2).map((p2) => p2.released);
      const bestForPair = path.released + Math.max(...releases);
      if (bestForPair > bestTotal) {
        bestTotal = bestForPair;
      }
    } else if (complement.length > 2) {
      check(path, complement.substring(0, complement.length - 2));
    }
  };
  paths.forEach((p) => {
    const complement = activeValves
      .filter((v) => !p.order.includes(v))
      .sort()
      .join('');
    check(p, complement);
  });
  return bestTotal;
}

describe('day 16', () => {
  test('sample data', () => {
    const graph = parse(sample.split('\n'));
    expect(graph).toBeTruthy();

    const s = evaluatePath(graph, [
      'DD',
      '**',
      'CC',
      'BB',
      '**',
      'AA',
      'II',
      'JJ',
      '**',
      'II',
      'AA',
      'DD',
      'EE',
      'FF',
      'GG',
      'HH',
      '**',
      'GG',
      'FF',
      'EE',
      '**',
      'DD',
      'CC',
      '**',
    ]);
    expect(s).toEqual(1651);

    const best = maxPressure(graph, 30);
    expect(best.released).toEqual(1651);

    const paths = getPressurePaths(graph, 26);
    const pair = findBestPair(graph, paths);
    expect(pair).toEqual(1707);
  });

  const graph = parse(getLines('day16.txt'));
  const best = maxPressure(graph, 30);
  test.todo(`Part 1: ${best.released}`);

  const bestb = getPressurePaths(graph, 26);
  const pair = findBestPair(graph, bestb);

  test.todo(`Part 2: ${pair}`);
});
