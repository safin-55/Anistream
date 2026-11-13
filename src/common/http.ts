import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { STATUS_CODES } from 'node:http';
import { NextFunction, Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const requestLogger = new Logger('HTTP');

export function requestLog(req: Request, res: Response, next: NextFunction) {
  const id = randomUUID();
  const started = process.hrtime.bigint();
  const path = req.path;

  res.setHeader('X-Request-Id', id);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    requestLogger.log(`${req.method} ${path} ${res.statusCode} ${elapsedMs.toFixed(1)}ms ${id}`);
  });

  next();
}

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (res.headersSent) {
      res.end();
      return;
    }

    let status = 500;
    let message: string | string[] = 'Internal server error';

    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string'
        ? body
        : (body as { message?: string | string[] }).message ?? error.message;
    } else if (error instanceof QueryFailedError) {
      const { code } = error.driverError as { code?: string };

      if (code === '23505') {
        status = 409;
        message = 'A record with the same unique value already exists';
      }
      if (code === '23503') {
        status = 409;
        message = 'A referenced record is missing or still in use';
      }
      if (code === '23514') {
        status = 400;
        message = 'The request violates a database constraint';
      }
    }

    const requestId = res.getHeader('X-Request-Id');

    if (status >= 500) {
      message = 'Internal server error';
      const errorName = error instanceof Error ? error.name : 'Error';
      requestLogger.error(`${req.method} ${req.path} ${requestId} ${errorName}`);
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      error: STATUS_CODES[status] ?? 'Request error',
      message,
      path: req.path,
      timestamp: new Date().toISOString(),
      requestId,
    });
  }
}