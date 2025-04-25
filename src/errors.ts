export enum PixeliteErrorCode {
  DecodeFailed = 'DECODE_FAILED',
  NetworkTimeout = 'NETWORK_TIMEOUT',
  FileReadFailed = 'FILE_READ_FAILED',
  UnsupportedSource = 'UNSUPPORTED_SOURCE',
}

export class PixeliteError extends Error {
  public readonly code: PixeliteErrorCode;
  public readonly details?: Record<string, any>;

  constructor(
    code: PixeliteErrorCode,
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, new.target);
    }
  }
}

export class PixeliteDecodeError extends PixeliteError {
  constructor(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions,
  ) {
    super(PixeliteErrorCode.DecodeFailed, message, details, options);
  }
}

export class PixeliteNetworkError extends PixeliteError {
  constructor(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions,
  ) {
    super(PixeliteErrorCode.NetworkTimeout, message, details, options);
  }
}

export class PixeliteFileReadError extends PixeliteError {
  constructor(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions,
  ) {
    super(PixeliteErrorCode.FileReadFailed, message, details, options);
  }
}

export class PixeliteSourceTypeError extends PixeliteError {
  constructor(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions,
  ) {
    super(PixeliteErrorCode.UnsupportedSource, message, details, options);
  }
}
