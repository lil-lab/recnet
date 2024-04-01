import { Inject, Injectable } from "@nestjs/common";
import Chance from "chance";

import InviteCodeRepository from "@recnet-api/database/repository/invite-code.repository";
import {
  InviteCode as DbInviteCode,
  InviteCodeFilterBy,
} from "@recnet-api/database/repository/invite-code.repository.type";
import { getOffset } from "@recnet-api/utils";

import { InviteCode } from "./entities/invite-code.entity";
import {
  CreateInviteCodeResponse,
  GetInviteCodeResponse,
} from "./invite-code.response";

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

  public async getInviteCodes(
    page: number,
    pageSize: number,
    filter: InviteCodeFilterBy
  ): Promise<GetInviteCodeResponse> {
    const inviteCodeCount =
      await this.inviteCodeRepository.countInviteCodes(filter);
    const dbInviteCodes = await this.inviteCodeRepository.findInviteCodes(
      page,
      pageSize,
      filter
    );
    const inviteCodes = this.getInviteCodesFromDbInviteCodes(dbInviteCodes);

    return {
      hasNext: inviteCodes.length + getOffset(page, pageSize) < inviteCodeCount,
      inviteCodes: inviteCodes,
    };
  }

  private getInviteCodesFromDbInviteCodes(
    dbInviteCodes: DbInviteCode[]
  ): InviteCode[] {
    return dbInviteCodes.map(this.getInviteCodeFromDbInviteCode);
  }

  private getInviteCodeFromDbInviteCode(
    dbInviteCode: DbInviteCode
  ): InviteCode {
    return {
      id: dbInviteCode.id,
      code: dbInviteCode.code,
      owner: {
        id: dbInviteCode.owner.id,
        handle: dbInviteCode.owner.handle,
        displayName: dbInviteCode.owner.displayName,
        photoUrl: dbInviteCode.owner.photoUrl,
        affiliation: dbInviteCode.owner.affiliation,
        bio: dbInviteCode.owner.bio,
        numFollowers: dbInviteCode.owner.followedBy.length,
      },
      issuedAt: dbInviteCode.issuedAt,
      usedAt: dbInviteCode.usedAt,
      usedBy: dbInviteCode.usedBy
        ? {
            id: dbInviteCode.usedBy.id,
            handle: dbInviteCode.usedBy.handle,
            displayName: dbInviteCode.usedBy.displayName,
            photoUrl: dbInviteCode.usedBy.photoUrl,
            affiliation: dbInviteCode.usedBy.affiliation,
            bio: dbInviteCode.usedBy.bio,
            numFollowers: dbInviteCode.usedBy.followedBy.length,
          }
        : null,
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
