import { Controller, Get, Param } from "@nestjs/common";
import { User as UserModel } from "@prisma/client";
import UserRepository from "src/database/repository/user.repository";

@Controller("user")
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  /* For development */
  @Get(":handle")
  public async getUserByHandle(
    @Param("handle") handle: string
  ): Promise<Promise<UserModel>> {
    return this.userRepository.findByHandle(handle);
  }
}
