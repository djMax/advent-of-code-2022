import day25 from '../src/days/day25';

const sample = `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`;

describe('day 25', () => {
  test('sample data', () => {
    expect(day25.part1(sample.split('\n'))).toEqual('2=-1=0');
  });
});
