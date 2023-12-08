import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export interface IError {
  status: number;
  errorCode: string;
  message: string;
  data: object;
}

export class ExceptionHelper {
  private static instance: ExceptionHelper;

  static getInstance(): ExceptionHelper {
    ExceptionHelper.instance =
      ExceptionHelper.instance || new ExceptionHelper();
    return ExceptionHelper.instance;
  }

  postNotFoundException(message: string): void {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      message: [message],
    });
  }

  noDataFound(): void {
    this.postNotFoundException('No_data_found');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  defaultError(
    message: string,
    errorCode: string,
    statusCode: number,
    data?: any,
  ): void {
    const error: IError = {
      status: statusCode,
      errorCode: errorCode,
      message: message ? message : '',
      data: data ? data : {},
    };
    throw new HttpException(error, statusCode);
  }
}
