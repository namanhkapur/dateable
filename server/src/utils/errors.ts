export enum ServerErrorCode {
  UnexpectedThrownError = 'unexpected_thrown_error',
  BadRequestError = 'bad_request_error',
  CompositeError = 'composite_error',
  NotFound = 'not_found',
  BadGateway = 'bad_gateway',
  ExpectedHttpError = 'expected_http_error',
}

export type ErrorResult = {
  isError: true;

  // Mapped error message from api.model
  message: string;

  // Error code returned from server
  errorCode: ServerErrorCode | null;
};

export const isErrorResult = (res: unknown): res is ErrorResult =>
  typeof res === 'object' &&
  res != null &&
  'isError' in res &&
  (res as any).isError === true &&
  typeof (res as any)?.message === 'string' &&
  'errorCode' in res;
