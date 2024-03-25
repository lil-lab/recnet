import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const recnetUser = request.user?.recnet;

    return data ? recnetUser?.[data] : recnetUser;
  }
);
