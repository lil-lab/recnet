import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, headers } = req;
    const requestId = uuidv4().substr(0, 8);

    const requestDetails = {
      method,
      url: originalUrl,
      headers,
      body,
    };

    this.logger.debug(
      `Request[${requestId}]: ${JSON.stringify(requestDetails)}`
    );

    next();

    res.on("finish", () => {
      this.logger.debug(
        `Response[${requestId}]: ${res.statusCode} ${res.statusMessage}`
      );
    });
  }
}
