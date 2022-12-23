export type FaceName = 'top' | 'back' | 'left' | 'front' | 'bottom' | 'right';

export type Position = [number, number];

export enum Contents {
  Blank = ' ',
  Wall = '#',
  Available = '.',
}

export enum Direction {
  Clockwise = 'R',
  Counterclockwise = 'L',
  NoChange = 'N',
}

export interface Move {
  direction: Direction;
  steps: number;
}

export enum Heading {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

export interface PosDir {
  heading: Heading;
  position: Position;
}
