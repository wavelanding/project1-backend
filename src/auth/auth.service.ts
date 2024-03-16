import { Injectable } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./token-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { getJwt } from "./jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(user: User, response: Response) {
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.getOrThrow("JWT_EXPIRATION")
    );

    const tokenPayload: TokenPayload = {
      ...user,
      _id: user._id.toHexString(),
    };

    const token = this.jwtService.sign(tokenPayload);

    // response.cookie() is part of Express.js
    // The cookie is named 'Authentication', and its value is the signed JWT.
    // the last param is cookie options
    response.cookie("Authentication", token, {
      httpOnly: true, // makes the cookie inaccessible to client-side scripts, only sent to the server during requests
      expires, // The expiration time of the cookie is set to the same value as the token expiration
    });

    return token;
  }

  verifyWs(request: Request, connectionParams: any = {}): TokenPayload {
    const cookies: string[] = request.headers.cookie?.split("; ");
    const authCookie = cookies?.find((cookie) =>
      cookie.includes("Authentication")
    );
    const jwt = authCookie?.split("Authentication=")[1];
    return this.jwtService.verify(jwt || getJwt(connectionParams.token));
  }

  logout(response: Response) {
    response.cookie("Authentication", "", {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
