import {
  Direction, Heading, Move, Contents, Position,
} from './types';

export function parse(text: string) {
  const [boardStr, movesStr] = text.split('\n\n');
  const board = boardStr
    .split('\n')
    .map((line) => line
      .split('')
      .map(
        (c) => ({ ' ': Contents.Blank, '#': Contents.Wall, '.': Contents.Available }[c]
            || Contents.Blank),
      ));
  const { value, moves } = movesStr.split('').reduce(
    (acc, c) => {
      if (c === 'L' || c === 'R') {
        acc.moves.push({ direction: c as Direction, steps: acc.value });
        return { value: 0, moves: acc.moves };
      }
      return { value: acc.value * 10 + Number(c), moves: acc.moves };
    },
    { value: 0, moves: [] as Move[] },
  );
  if (value) {
    moves.push({ direction: Direction.NoChange, steps: value });
  }
  const start = board[0].findIndex((p) => p === Contents.Available);
  return { board, moves, start: [start, 0] as [number, number] };
}

export function turn(heading: Heading, direction: Direction): Heading {
  if (direction === Direction.NoChange) {
    return heading;
  }

  const dirChange = direction === Direction.Clockwise ? 1 : -1;
  return (heading + 4 + dirChange) % 4 as Heading;
}

export const DELTAS: Record<Heading, Position> = {
  [Heading.Right]: [1, 0],
  [Heading.Down]: [0, 1],
  [Heading.Left]: [-1, 0],
  [Heading.Up]: [0, -1],
};

export function score([x, y]: Position, facing: Heading) {
  return 1000 * (y + 1) + 4 * (x + 1) + facing;
}
