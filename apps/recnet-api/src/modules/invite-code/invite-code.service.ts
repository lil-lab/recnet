import { Inject, Injectable } from "@nestjs/common";
import Chance from "chance";

import InviteCodeRepository from "@recnet-api/database/repository/invite-code.repository";

import { CreateInviteCodeResponse } from "./invite-code.response";

@Injectable()
export class InviteCodeService {
  constructor(
    @Inject(InviteCodeRepository)
    private readonly inviteCodeRepository: InviteCodeRepository
  ) {}

  public async createInviteCode(
    numCodes: number,
    ownerId: string
  ): Promise<CreateInviteCodeResponse> {
    const codes = Array.from({ length: numCodes }, () => this.genRandomCode());
    await this.inviteCodeRepository.createInviteCode(codes, ownerId);
    return {
      codes: codes,
    };
  }

  private genRandomCode(): string {
    const chance = new Chance();
    const code = chance.string({
      length: 16,
      pool: "abcdefghijklmnopqrstuvwxyz0123456789",
    });
    // split the code into 4 parts
    return (code.match(/.{1,4}/g) as string[]).join("-");
  }
}
