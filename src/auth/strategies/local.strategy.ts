import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UsersService } from "../../users/users.service";

/**
 * By default, the passport-local strategy expects the credentials to consist of a username and a password.
 * LocalStrategy sets usernameField: 'email' configures the passport-local strategy to use the email field from the request as the "username".
 *
 * This means when the validate method is called during the authentication process, the first argument received will be the value of the email field from the login request, not a username field.
 *
 * NestJS assigns a default name based on the strategy's class (local for JWT Strategy)
 * Add "local" so that explicitly link this strategy to local-auth.guard.ts
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private readonly usersService: UsersService) {
    super({
      //super call constructor from Stratey which is passport-local, not UsersService.
      usernameField: "email",
    });
  }

  // after validate method, the returned object, e.g. user, will attach to the request object.
  // this email and password is past by the frontend useLogin hook, inside it has body: JSON.stringify(request)
  async validate(email: string, password: string) {
    try {
      return await this.usersService.verifyUser(email, password);
    } catch (err) {
      // throw new UnauthorizedException("Credentials are not valid.");
      throw new UnauthorizedException(err);
    }
  }
}
