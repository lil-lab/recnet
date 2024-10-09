import { ReactionType } from "@prisma/client";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import RecRepository from "@recnet-api/database/repository/rec.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { RecService } from "../rec.service";

describe("RecService", () => {
  let service: RecService;
  let recRepository: RecRepository;
  let userRepository: UserRepository;
  let articleRepository: ArticleRepository;
  const mockUserId = "30a38241-19ea-4702-b847-b6b832b6d4e9";
  const mockRecId = "bc67bd40-7c36-41a1-923d-eadc963ebaaa";

  beforeEach(async () => {
    recRepository = {
      findRecById: jest.fn().mockResolvedValue({}),
      createRecReaction: jest.fn().mockResolvedValue({}),
      deleteRecReaction: jest.fn().mockResolvedValue({}),
    } as unknown as RecRepository;

    service = new RecService(recRepository, userRepository, articleRepository);
  });

  describe("createRecReaction", () => {
    it("should create a reaction when valid", async () => {
      await service.createRecReaction(mockUserId, mockRecId, "THUMBS_UP");

      expect(recRepository.findRecById).toHaveBeenCalledWith(mockRecId);
      expect(recRepository.createRecReaction).toHaveBeenCalledWith(
        mockUserId,
        mockRecId,
        ReactionType.THUMBS_UP
      );
    });

    it("should throw an error when reaction is invalid", async () => {
      await expect(
        service.createRecReaction(mockUserId, mockRecId, "INVALID_REACTION")
      ).rejects.toThrow(
        new RecnetError(
          ErrorCode.INVALID_REACTION_TYPE,
          400,
          "Invalid reaction type"
        )
      );
    });

    it("should throw an error when rec does not exist", async () => {
      jest
        .spyOn(recRepository, "findRecById")
        .mockRejectedValue(new Error("rec not found"));

      await expect(
        service.createRecReaction(mockUserId, mockRecId, "THUMBS_UP")
      ).rejects.toThrow();
    });
  });

  describe("deleteRecReaction", () => {
    it("should delete a reaction when valid", async () => {
      await service.deleteRecReaction(mockUserId, mockRecId, "THUMBS_UP");

      expect(recRepository.findRecById).toHaveBeenCalledWith(mockRecId);
      expect(recRepository.deleteRecReaction).toHaveBeenCalledWith(
        mockUserId,
        mockRecId,
        ReactionType.THUMBS_UP
      );
    });

    it("should throw an error when reaction is invalid", async () => {
      await expect(
        service.deleteRecReaction(mockUserId, mockRecId, "INVALID_REACTION")
      ).rejects.toThrow(
        new RecnetError(
          ErrorCode.INVALID_REACTION_TYPE,
          400,
          "Invalid reaction type"
        )
      );
    });

    it("should throw an error when rec does not exist", async () => {
      jest
        .spyOn(recRepository, "findRecById")
        .mockRejectedValue(new Error("rec not found"));

      await expect(
        service.deleteRecReaction(mockUserId, mockRecId, "THUMBS_UP")
      ).rejects.toThrow();
    });

    it("should throw an error when rec reaction does not exist", async () => {
      jest
        .spyOn(recRepository, "deleteRecReaction")
        .mockRejectedValue(new Error("rec reaction not found"));

      await expect(
        service.deleteRecReaction(mockUserId, mockRecId, "THUMBS_UP")
      ).rejects.toThrow();
    });
  });
});
