import { Controller, Post, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../users/entities/user.entity";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(LocalAuthGuard)
  // RESTful api makes more sense than GQL mutation in this case.
  // return jwt token
  /**
   * The final response sent to the client includes any cookies or headers you set on the response object
   * and whatever was returned from your controller method as the body, to the token from AuthService is in res body
   *
   * By using @Res({ passthrough: true }), you're telling NestJS to pass the response object through to your service method, allowing you to manipulate the response (e.g., setting cookies, headers) directly in the service.
   * However, unlike the regular usage of @Res(), which would typically take over response handling entirely, passthrough: true lets you continue using the automatic response handling provided by NestJS.
   * This means you can still return data from your controller or service, and NestJS will automatically send it as the HTTP response body.
   */
  async login(
    @CurrentUser() user: User, // before this decorator, the user object is attached to request by @UseGuards(LocalAuthGuard) during validation
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(user, response); // this login is way different with the front version .. not good!
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
  }
}
