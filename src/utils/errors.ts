export enum PixeliftErrorCode {
  FileReadFailed     = 'FILE_READ_FAILED',
  DecodeFailed       = 'DECODE_FAILED',
  NetworkError     = 'NETWORK_ERROR',
}

export class PixeliftError extends Error {
  public readonly code: PixeliftErrorCode;
  public readonly details?: Record<string, any>;

  constructor(
    code: PixeliftErrorCode,
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions
  ) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'PixeliteError';
    this.code = code;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PixeliftError);
    }
  }

  static decodeFailed(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions
  ): PixeliftError {
    return new PixeliftError(
      PixeliftErrorCode.DecodeFailed,
      message,
      details,
      options
    );
  }

  static networkError(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions
  ): PixeliftError {
    return new PixeliftError(
      PixeliftErrorCode.NetworkError,
      message,
      details,
      options
    );
  }

  static fileReadFailed(
    message: string,
    details?: Record<string, any>,
    options?: ErrorOptions
  ): PixeliftError {
    return new PixeliftError(
      PixeliftErrorCode.FileReadFailed,
      message,
      details,
      options
    );
  }
}
