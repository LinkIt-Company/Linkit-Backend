import { ExceptionPayload } from '../types/type';

export abstract class RootException<
  T extends ExceptionPayload = ExceptionPayload,
  U extends number = number,
> extends Error {
  constructor(
    public readonly payload: T,
    public readonly statuscode: U,
    public readonly name: string,
  ) {
    super();
    this.message = payload.message as string;
  }
}
