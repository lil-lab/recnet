import { Inject, Injectable } from "@nestjs/common";

import RecRepository from "@recnet-api/database/repository/rec.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";

import { getNextCutOff } from "@recnet/recnet-date-fns";

import { QueryStatResponse } from "./stat.response";

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
}
