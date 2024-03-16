import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";

/**
 * NestJS can handle multiple communication contexts (HTTP REST / GraphQL) within the same application framework.
 * This flexibility is crucial for building applications that may expose different types of APIs but still need a unified way to perform common tasks like authentication and user retrieval.
 * NestJS abstracts over the specifics of these different communication paradigms through the use of the ExecutionContext interface
 *
 * this returned user is set by the jwt.strategy.ts which is of TokenPayload type
 */
const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === "http") {
    return context.switchToHttp().getRequest().user;
  } else if (context.getType<GqlContextType>() === "graphql") {
    return GqlExecutionContext.create(context).getContext().req.user;
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context)
);
