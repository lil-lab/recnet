/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { LogLevel, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { getLogLevels } from "./utils/logger";

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const logLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) ||
    (nodeEnv === "production" ? "warn" : "debug");

  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(logLevel),
  });
  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle("Recnet API")
    .setDescription("This is the Recnet API document.")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
