import { getLines } from '../src/index';

enum Choice {
  Rock,
  Paper,
  Scissors,
}

const ShapeScore = {
  [Choice.Rock]: 1,
  [Choice.Paper]: 2,
  [Choice.Scissors]: 3,
};

enum ResultScore {
  IWin = 6,
  TheyWin = 0,
  Tie = 3,
}

const ChoiceToInstruction = {
  [Choice.Rock]: ResultScore.TheyWin,
  [Choice.Paper]: ResultScore.Tie,
  [Choice.Scissors]: ResultScore.IWin,
};

function resultScore(them: Choice, me: Choice) {
  if (them === me) {
    return ResultScore.Tie;
  }
  switch (me) {
    case Choice.Rock:
      return them === Choice.Scissors ? ResultScore.IWin : ResultScore.TheyWin;
    case Choice.Paper:
      return them === Choice.Rock ? ResultScore.IWin : ResultScore.TheyWin;
    case Choice.Scissors:
      return them === Choice.Paper ? ResultScore.IWin : ResultScore.TheyWin;
    default:
      throw new Error(`Unknown result ${them} vs ${me}`);
  }
}

// Easiest way to make TS happy
function strToChoice(str: string): Choice {
  switch (str) {
    case 'A':
    case 'X':
      return Choice.Rock;
    case 'B':
    case 'Y':
      return Choice.Paper;
    case 'C':
    case 'Z':
      return Choice.Scissors;
    default:
      throw new Error(`Unknown choice ${str}`);
  }
}

function getMatchingChoice(them: Choice, me: ResultScore) {
  if (me === ResultScore.Tie) {
    return them;
  }
  switch (them) {
    case Choice.Rock:
      return me === ResultScore.IWin ? Choice.Paper : Choice.Scissors;
    case Choice.Paper:
      return me === ResultScore.IWin ? Choice.Scissors : Choice.Rock;
    case Choice.Scissors:
      return me === ResultScore.IWin ? Choice.Rock : Choice.Paper;
    default:
      throw new Error(`Unknown choice against ${them}: ${me}`);
  }
}

describe('day 2', () => {
  test('Basic results', () => {
    expect(resultScore(Choice.Rock, Choice.Rock)).toBe(ResultScore.Tie);
    expect(resultScore(Choice.Rock, Choice.Paper)).toBe(ResultScore.IWin);
    expect(resultScore(Choice.Rock, Choice.Scissors)).toBe(ResultScore.TheyWin);
  });

  const p1Score = getLines('day2.txt').reduce((total, line) => {
    const [them, me] = line.split(' ').map(strToChoice);
    return total + ShapeScore[me] + resultScore(them, me);
  }, 0);
  test.todo(`Part 1 Result: ${p1Score}`);
  expect(p1Score).toEqual(11666);

  const p2Score = getLines('day2.txt').reduce((total, line) => {
    const [them, me] = line.split(' ').map(strToChoice);
    return (
      total + ShapeScore[getMatchingChoice(them, ChoiceToInstruction[me])] + ChoiceToInstruction[me]
    );
  }, 0);
  test.todo(`Part 2 Result: ${p2Score}`);
});
