import lodash from 'lodash';
import { getLines } from '../src/index';

function findFirstPacketMarker(p: string, n = 4) {
  const chars = p.split('');
  for (let i = n; i < p.length; i += 1) {
    if (lodash.uniq(chars.slice(i - n, i)).length === n) {
      return i;
    }
  }
  return undefined;
}

describe('day 6', () => {
  test('sample data', () => {
    expect(findFirstPacketMarker('mjqjpqmgbljsphdztnvjfqwrcgsmlb')).toEqual(7);
    expect(findFirstPacketMarker('bvwbjplbgvbhsrlpgdmjqwftvncz')).toEqual(5);
    expect(findFirstPacketMarker('nppdvjthqldpwncqszvftbrmjlhg')).toEqual(6);
    expect(findFirstPacketMarker('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg')).toEqual(10);
    expect(findFirstPacketMarker('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw')).toEqual(11);

    expect(findFirstPacketMarker('mjqjpqmgbljsphdztnvjfqwrcgsmlb', 14)).toEqual(19);
    expect(findFirstPacketMarker('bvwbjplbgvbhsrlpgdmjqwftvncz', 14)).toEqual(23);
    expect(findFirstPacketMarker('nppdvjthqldpwncqszvftbrmjlhg', 14)).toEqual(23);
    expect(findFirstPacketMarker('nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg', 14)).toEqual(29);
    expect(findFirstPacketMarker('zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw', 14)).toEqual(26);
  });

  const [line] = getLines('day6.txt');
  test.todo(`Part 1 Result: ${findFirstPacketMarker(line)}`);
  test.todo(`Part 2 Result: ${findFirstPacketMarker(line, 14)}`);
});
