import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException ? (exception.getResponse() as any)?.message || exception.message : 'Internal server error';

    this.logger.error(`${request.method} ${request.url}`, (exception as any)?.stack || String(exception));

    if (!response.headersSent) {
      response.status(status).json({ statusCode: status, message });
    }
  }
}
