import lodash from 'lodash';
import { expose } from 'threads/worker';
import { Blueprint, Resource } from './index';

interface State {
  resource: Record<Resource, number>;
  robots: Record<Resource, number>;
  actions: string[];
  minute: number;
}

const EMPTY: State = {
  resource: {
    ore: 0, clay: 0, obsidian: 0, geode: 0,
  },
  robots: {
    ore: 1, clay: 0, obsidian: 0, geode: 0,
  },
  actions: [],
  minute: 0,
};

const RESOURCES: Resource[] = ['ore', 'clay', 'obsidian', 'geode'];

function key(s: State) {
  return [
    s.minute,
    s.resource.ore,
    s.resource.clay,
    s.resource.obsidian,
    s.resource.geode,
    s.robots.ore,
    s.robots.clay,
    s.robots.obsidian,
    s.robots.geode,
  ].join(',');
}

function getNextMinute(s: State) {
  const resource = lodash.mapValues(s.resource, (v, k) => v + s.robots[k as Resource]);
  const minute = s.minute + 1;
  return {
    ...s,
    resource,
    minute,
    actions: [...s.actions, `${minute} ${JSON.stringify(resource)}`],
  };
}

function canAfford(resource: Record<Resource, number>, cost: Record<Resource, number>) {
  return (Object.keys(cost) as Resource[]).every((k) => resource[k] >= cost[k]);
}

function addRobot(s: State, robotType: Resource, cost: Record<Resource, number>) {
  return {
    ...s,
    resource: lodash.mapValues(s.resource, (v, k) => v - cost[k as Resource] || 0),
    actions: [...s.actions, `${s.minute} Build ${robotType}`],
    robots: { ...s.robots, [robotType]: s.robots[robotType] + 1 },
  };
}

function maxGeodes(state: State, m: number) {
  // Assume we can build one geode robot per minute
  const a = state.robots.geode;
  return state.resource.geode + Math.ceil(((2 * a + (m - 1)) * m) / 2);
}

expose((blueprint: Blueprint, minutes: number) => {
  const visited = new Set<string>();
  const maxCost = (r: Resource) => Math.max(...Object.values(blueprint.costs).map((c) => c[r]));
  const maxRobots = {
    ore: maxCost('ore'),
    clay: maxCost('clay'),
    obsidian: maxCost('obsidian'),
    geode: Number.MAX_SAFE_INTEGER,
  };

  let bestGeodes: State = EMPTY;

  const q = [EMPTY];
  const expand = (state: State) => {
    const remaining = minutes - state.minute - 1;

    const nextState = getNextMinute(state);
    if (bestGeodes.resource.geode < nextState.resource.geode) {
      bestGeodes = nextState;
    }

    if (maxGeodes(nextState, remaining + 1) < bestGeodes.resource.geode) {
      return;
    }

    if (remaining === 0) {
      return;
    }

    const nsk = key(nextState);
    if (!visited.has(nsk)) {
      visited.add(nsk);
      q.push(nextState);
    }

    // Build robots if we can afford them BASED ON THE INCOMING STATE,
    // not on the state after the robots build from this minute. This cost me an hour.
    if (canAfford(state.resource, blueprint.costs.geode)) {
      // This is always the right move. (I think)
      const gState = addRobot(nextState, 'geode', blueprint.costs.geode);
      const k = key(gState);
      if (!visited.has(k)) {
        visited.add(k);
        q.push(gState);
      }
      return;
    }

    for (let i = 0; i < RESOURCES.length; i += 1) {
      const r = RESOURCES[i];

      // No point in building non-geode robots at the last minute
      if (
        remaining > 1
        && nextState.robots[r] < maxRobots[r]
        && canAfford(state.resource, blueprint.costs[r])
      ) {
        const newRobot = addRobot(nextState, r, blueprint.costs[r]);
        const k = key(newRobot);
        if (!visited.has(k)) {
          visited.add(k);
          q.push(newRobot);
        }
      }
    }
  };

  while (q.length) {
    expand(q.pop()!);
  }

  return bestGeodes.resource.geode;
});
