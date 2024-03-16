import { Logger, Module, UnauthorizedException } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { DatabaseModule } from "./common/database/database.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { UsersModule } from "./users/users.module";
import { LoggerModule } from "nestjs-pino";
import { AuthModule } from "./auth/auth.module";
import { ChatsModule } from "./chats/chats.module";
import { PubSubModule } from "./common/pubsub/pubsub.module";
import { Request } from "express";
import { AuthService } from "./auth/auth.service";

const isProduction = (conf: string) => {
  return conf === "production";
};

const getPinoOptions = (isProduction: boolean) => {
  return {
    transport: isProduction
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            singleLine: true,
          },
        },
    level: isProduction ? "info" : "debug",
  };
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (authService: AuthService, configService: ConfigService) => ({
        autoSchemaFile: true,
        // path: local is /, aws is /api/graphql"
        path: isProduction(configService.get("NODE_ENV"))
          ? "/api/graphql"
          : "/",
        // configService.get("NODE_ENV") === "production" ? "/api/graphql" : "/",
        cors: !isProduction(configService.get("NODE_ENV")), // local is true, aws is false
        subscriptions: {
          "graphql-ws": {
            path: "/api/graphql",
            onConnect: (context: any) => {
              try {
                const request: Request = context.extra.request;
                const user = authService.verifyWs(
                  request,
                  context.connectionParams
                );
                context.user = user;
              } catch (err) {
                new Logger().error(err);
                throw new UnauthorizedException();
              }
            },
          },
        },
      }),
      imports: [AuthModule],
      inject: [AuthService, ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // const isProduction = configService.get("NODE_ENV") === "production";
        return {
          pinoHttp: getPinoOptions(isProduction(configService.get("NODE_ENV"))),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ChatsModule,
    PubSubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
