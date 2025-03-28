import { ExceptionPayload } from '../types/type';
import { RootException } from './exception.abstract';

const codeUnknown = 'Unknown';

export const createException = (
  statusCode: number,
  message: string,
  code = codeUnknown,
) => {
  const payload: ExceptionPayload = {
    code: code,
    message: message,
  };

  const errorContextName =
    code === codeUnknown ? `${codeUnknown} - ${message}` : code;
  return class extends RootException {
    constructor() {
      super(payload, statusCode, errorContextName);
    }
  };
};
