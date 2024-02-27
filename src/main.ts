import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  // app.enableCors(); // for local
  // app.setGlobalPrefix('/api'); // for aws
  const configService = app.get(ConfigService);
  if (configService.get("NODE_ENV") === "production") {
    app.setGlobalPrefix("/api"); // for aws
  } else {
    app.enableCors(); // for local
  }
  await app.listen(configService.getOrThrow("PORT"));
}
bootstrap();
