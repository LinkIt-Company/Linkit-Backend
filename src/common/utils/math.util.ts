export const sum = <T = number | object>(
  _list: T[],
  selector?: T extends object ? (item: T) => number : never,
): number => {
  if (_list.length === 0) return 0;

  const list = (selector ? _list.map(selector) : _list) as number[];
  return list.reduce((sum, cur) => cur + sum, 0);
};
