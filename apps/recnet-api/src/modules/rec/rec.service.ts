import { Inject, Injectable } from "@nestjs/common";

import RecRepository from "@recnet-api/database/repository/rec.repository";
import { getOffset } from "@recnet-api/utils";

import { Rec } from "./entities/rec.entity";
import { GetRecsResponse } from "./rec.response";

@Injectable()
export class RecService {
  constructor(
    @Inject(RecRepository)
    private readonly recRepository: RecRepository
  ) {}

  public async getRecs(
    page: number,
    pageSize: number,
    userId: string
  ): Promise<GetRecsResponse> {
    const recCount = await this.recRepository.countRecs(userId);
    const dbRecs = await this.recRepository.findRecs(page, pageSize, userId);

    const recs: Rec[] = dbRecs.map((dbRec) => {
      return {
        ...dbRec,
        cutoff: dbRec.cutoff.toISOString(),
        user: {
          id: dbRec.user.id,
          handle: dbRec.user.handle,
          displayName: dbRec.user.displayName,
          photoUrl: dbRec.user.photoUrl,
          affiliation: dbRec.user.affiliation,
          bio: dbRec.user.bio,
          numFollowers: dbRec.user.followedBy.length,
        },
        article: {
          ...dbRec.article,
        },
      };
    });

    return {
      hasNext: recs.length + getOffset(page, pageSize) < recCount,
      recs: recs,
    };
  }
}
