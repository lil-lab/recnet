import { Inject, Injectable } from "@nestjs/common";

import RecRepository from "@recnet-api/database/repository/rec.repository";
import { RecFilterBy } from "@recnet-api/database/repository/rec.repository.type";
import UserRepository from "@recnet-api/database/repository/user.repository";

import { getNextCutOff } from "@recnet/recnet-date-fns";

import { QueryStatResponse, GetStatsRecsResponse } from "./stat.response";

import { transformRec } from "../rec/rec.transformer";

@Injectable()
export class StatService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(RecRepository)
    private readonly recRepository: RecRepository
  ) {}

  public async getStats(): Promise<QueryStatResponse> {
    const numUsers = await this.userRepository.countUsers();
    const numRecs = await this.recRepository.countRecs();
    const numUpcomingRecs = await this.recRepository.countRecs({
      cutoff: getNextCutOff(),
    });
    const recCountPerCycle = await this.recRepository.getRecCountPerCutoff();

    return {
      numUsers,
      numRecs,
      numUpcomingRecs,
      numRecsOverTime: recCountPerCycle.reduce((acc, data) => {
        const ts = data.cutoff.getTime();
        const count = data.count;
        return {
          ...acc,
          [ts]: count,
        };
      }, {}),
    };
  }

  public async getStatsRecs(cutoff: number): Promise<GetStatsRecsResponse> {
    const endDate = new Date(cutoff);
    const startDate = new Date(cutoff);
    startDate.setDate(startDate.getDate() - 7);

    const filter: RecFilterBy = {
      cutoff: { from: startDate, to: endDate },
    };

    const dbRecs = await this.recRepository.findRecs(1, 1000, filter);
    const recs = dbRecs.map((dbRec) => transformRec(dbRec, null));

    return { recs };
  }
}
