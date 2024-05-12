import { Inject, Injectable } from "@nestjs/common";
import Chance from "chance";

import InviteCodeRepository from "@recnet-api/database/repository/invite-code.repository";
import {
  InviteCode as DbInviteCode,
  InviteCodeFilterBy,
} from "@recnet-api/database/repository/invite-code.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { getOffset } from "@recnet-api/utils";

import { InviteCode } from "./entities/invite-code.entity";
import {
  CreateInviteCodeResponse,
  GetAllInviteCodeResponse,
} from "./invite-code.response";

@Injectable()
export class InviteCodeService {
  constructor(
    @Inject(InviteCodeRepository)
    private readonly inviteCodeRepository: InviteCodeRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  public async createInviteCode(
    numCodes: number,
    ownerId: string | null,
    upperBound: number | null
  ): Promise<CreateInviteCodeResponse> {
    const targetUserIds: string[] = [];
    if (ownerId) {
      targetUserIds.push(ownerId);
    } else {
      const users = await this.userRepository.findAllUsers();
      targetUserIds.push(...users.map((user) => user.id));
    }

    const codesToBeCreated: {
      code: string;
      ownerId: string;
    }[] = [];

    const userExistingCodesCount =
      await this.inviteCodeRepository.countInviteCodesByOwnerIds(targetUserIds);

    userExistingCodesCount.forEach(
      ({ userId: ownerId, count: existingCodeCount }) => {
        const numCodesToGenerate =
          upperBound !== null
            ? Math.min(upperBound - existingCodeCount, numCodes)
            : numCodes;

        const newCodes = Array.from({ length: numCodesToGenerate }, () => ({
          ownerId,
          code: this.genRandomCode(),
        }));
        codesToBeCreated.push(...newCodes);
      }
    );

    await this.inviteCodeRepository.createInviteCode(codesToBeCreated);
    return {
      codes: codesToBeCreated.map((pair) => pair.code),
    };
  }

  public async getInviteCodes(
    page: number,
    pageSize: number,
    filter: InviteCodeFilterBy
  ): Promise<GetAllInviteCodeResponse> {
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

  public async countInviteCodes(filter: InviteCodeFilterBy): Promise<number> {
    return this.inviteCodeRepository.countInviteCodes(filter);
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
        url: dbInviteCode.owner.url,
        numFollowers: dbInviteCode.owner.followedBy.length,
        numRecs: dbInviteCode.owner.recommendations.length,
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
            url: dbInviteCode.usedBy.url,
            numFollowers: dbInviteCode.usedBy.followedBy.length,
            numRecs: dbInviteCode.usedBy.recommendations.length,
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
