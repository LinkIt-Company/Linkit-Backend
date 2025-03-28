import { ExceptionPayload } from '../types/type';

export const createErrorObject = (
  errorCode: string,
  message: string,
): ExceptionPayload => {
  return {
    code: errorCode,
    message: message,
  };
};
