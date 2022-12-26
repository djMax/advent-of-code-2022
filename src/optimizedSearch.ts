import Heap from 'heap';
import { log } from './index';

export interface World {}

const debug = !!process.env.DEBUG;

export interface State<W extends World> {
  // Get a key that can be used to identify this state for pruning
  // purposes
  key: string;

  completed: boolean;

  // Upon completion, isBetter will determine which one wins
  // (> 0 means I win, 0 means tie, < 0 means I lose)
  compare(other: this): number;

  // Whether we should prune this state given the existing
  // best state
  shouldPrune(best: this): boolean;

  // Generate all possible next states from this state.
  // world and explored can be used to proactively prune states
  getNextStates(world: W, explored: Set<string>): State<W>[];
}

export function optimizedSearch<W extends World, S extends State<World>>(
  world: W,
  initialState: S,
): S | undefined {
  const q = new Heap<S>((a, b) => b.compare(a));
  q.push(initialState);
  const statesVisited = new Set<string>();
  let bestCompletion: S | undefined;
  let examined = 0;

  const examine = (next: S) => {
    const stateKey = next.key;
    if (stateKey && statesVisited.has(stateKey)) {
      // Prune this tree, we've already seen it
      return;
    }
    statesVisited.add(stateKey);

    if (next.completed) {
      if (!bestCompletion || next.compare(bestCompletion) > 0) {
        bestCompletion = next;
      }
      // Do not expand from here
      return;
    }

    if (bestCompletion && next.shouldPrune(bestCompletion)) {
      // Prune this tree, it's worse than the best completion
      return;
    }

    examined += 1;
    if (debug && examined % 1000 === 0) {
      log('Examined', examined, 'states', bestCompletion ? `best ${bestCompletion.toString()}` : 'no solution');
    }
    const nextStates = next.getNextStates(world, statesVisited) as S[];
    nextStates.filter((s) => !statesVisited.has(s.key)).forEach((n) => q.push(n));
  };

  while (q.size()) {
    const next = q.pop()!;
    examine(next);
  }

  return bestCompletion;
}
