import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../token-payload.interface";
import { getJwt } from "../jwt";

/**
 * NestJS assigns a default name based on the strategy's class (jwt for JWT Strategy)
 * PassportStrategy: This is a utility function provided by NestJS that wraps a Passport strategy to integrate it with NestJS's dependency injection system and modules.
 * Explicitly specify "jwt", don't be a retard!!
 *
 * if the token from the authentication cookie is not valid, the validate method is not called,
 * instead it will throw an unauthorized exception.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (request.cookies.Authentication) {
            return request.cookies.Authentication;
          }
          return getJwt(request.headers.authorization);
        },
      ]),
      secretOrKey: configService.getOrThrow("JWT_SECRET"),
    });
  }

  // TokenPayload is supplied by jwt stratety, decoded from the jwt token if it's valid
  validate(payload: TokenPayload) {
    return payload;
  }
}
