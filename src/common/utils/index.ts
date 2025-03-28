import { FunctionType } from '../types/type';

export * from './createErrorObject.util';
export * from './math.util';
export * from './parser.util';

export const pipe = (...functions: FunctionType[]) => {
  return (initial: unknown) =>
    functions.reduce((result, func) => {
      return func(result);
    }, initial);
};
