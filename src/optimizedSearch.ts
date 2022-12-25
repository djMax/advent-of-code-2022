export interface World {
  initialState: State<this>;
}

export interface State<W extends World> {
  // Higher is better. Used to prioritize states for exploration
  expectedScore: number;

  // Get a key that can be used to identify this state for pruning
  // purposes
  key: string;

  completed: boolean;

  // Upon completion, isBetter will determine which one wins
  // (> 0 means I win, 0 means tie, < 0 means I lose)
  compare(other: State<W>): number;

  // Generate all possible next states from this state.
  // world and explored can be used to proactively prune states
  getNextStates: (world: W, explored: Set<string>) => State<W>[];
}

export function optimizedSearch<W extends World>(world: W) {
  // TODO priority queue
  const q: State<W>[] = [world.initialState];
  const statesVisited = new Set<string>();
  let bestCompletion: State<W> | undefined;

  const examine = (next: S) => {
    if (next.completed) {
      if (!bestCompletion || next.compare(bestCompletion) > 0) {
        bestCompletion = next;
      }
      // Do not expand from here
      return;
    }

    if (bestCompletion && next.compare(bestCompletion) < 0) {
      // Prune this tree, it's worse than the best completion
      return;
    }

    const stateKey = next.key;
    if (stateKey && statesVisited.has(stateKey)) {
      // Prune this tree, we've already seen it
      return;
    }

    const nextStates = next.getNextStates(world, statesVisited);
    q.push(...nextStates);
  };

  while (q.length) {
    const next = q.pop()!;
    examine(next);
  }

  return bestCompletion;
}
