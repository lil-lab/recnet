import { HttpStatus } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { createMockDbRec } from "@recnet-api/test/mock/rec.mock";
import { createMockDbUser } from "@recnet-api/test/mock/user.mock";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { getLatestCutOff } from "@recnet/recnet-date-fns";

import { RecService } from "../rec.service";

describe("RecService", () => {
  let recService: RecService;
  let recRepository: unknown;
  let userRepository: unknown;
  let articleRepository: unknown;

  beforeEach(() => {
    recRepository = {
      countRecs: jest.fn(),
      findRecs: jest.fn(),
    };
    userRepository = {};
    articleRepository = {};
    recService = new RecService(
      recRepository as RecRepository,
      userRepository as UserRepository,
      articleRepository as ArticleRepository
    );
  });

  describe("getRecs", () => {
    it("should throw error when the user is not activated", async () => {
      const userId = "test-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({ id: userId, isActivated: false })
        );

      await expect(recService.getRecs(1, 10, userId)).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.ACCOUNT_NOT_ACTIVATED,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should return recs successfully", async () => {
      const userId = "test-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(createMockDbUser({ id: userId, isActivated: true }));
      (recRepository as RecRepository).countRecs = jest
        .fn()
        .mockResolvedValue(1);
      (recRepository as RecRepository).findRecs = jest
        .fn()
        .mockResolvedValue([createMockDbRec()]);

      const result = await recService.getRecs(1, 10, userId);

      expect(result.hasNext).toBe(false);
      expect(result.recs.length).toBe(1);
    });
  });

  describe("getFeeds", () => {
    it("should throw error when the cutoff is invalid", async () => {
      const userId = "test-user-id";
      const cutoff = 123456;
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(createMockDbUser({ id: userId }));

      return expect(recService.getFeeds(1, 10, cutoff, userId)).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.INVALID_CUTOFF,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should return feeds successfully if the cutoff is correct", async () => {
      const userId = "test-user-id";
      const followingUserId = "test-following-user-id";
      const cutoff = getLatestCutOff().getTime();
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({
            following: [
              {
                followingId: followingUserId,
                following: { id: followingUserId, isActivated: true },
              },
            ],
          })
        );
      (recRepository as RecRepository).countRecs = jest
        .fn()
        .mockResolvedValue(1);
      (recRepository as RecRepository).findRecs = jest
        .fn()
        .mockResolvedValue([createMockDbRec()]);

      const result = await recService.getFeeds(1, 10, cutoff, userId);

      expect(result.hasNext).toBe(false);
      expect(result.recs.length).toBe(1);
    });
  });
});
