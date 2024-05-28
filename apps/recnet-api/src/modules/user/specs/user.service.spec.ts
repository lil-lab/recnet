import { HttpStatus } from "@nestjs/common";

import FollowingRecordRepository from "@recnet-api/database/repository/followingRecord.repository";
import InviteCodeRepository from "@recnet-api/database/repository/invite-code.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";
import {
  createMockDbUser,
  createMockDbUserPreview,
} from "@recnet-api/test/mock/user.mock";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { AuthProvider } from "@recnet/recnet-jwt";

import { UserService } from "../user.service";

describe("UserService", () => {
  let userService: UserService;
  let userRepository: unknown;
  let inviteCodeRepository: unknown;
  let followingRecordRepository: unknown;

  beforeEach(async () => {
    userRepository = {
      findUserById: jest.fn(),
      findUserPreviewByIds: jest.fn().mockResolvedValue([]),
    };

    inviteCodeRepository = {
      findInviteCode: jest.fn(),
    };

    followingRecordRepository = {
      createFollowingRecord: jest.fn(),
      deleteFollowingRecord: jest.fn(),
    };

    userService = new UserService(
      userRepository as UserRepository,
      inviteCodeRepository as InviteCodeRepository,
      followingRecordRepository as FollowingRecordRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const createMockUserData = () => ({
      handle: "test-handle",
      displayName: "test-display-name",
      photoUrl: "test-photo-url",
      affiliation: "test-affiliation",
      bio: "test-bio",
      url: "test-url",
      googleScholarLink: "test-google-scholar-link",
      semanticScholarLink: "test-semantic-scholar-link",
      openReviewUserName: "test-open-review-user-name",
      email: "test-email",
      inviteCode: "test-invite-code",
    });
    const provider = AuthProvider.Google;
    const providerId = "test-provider-id";

    it("should throw error when the invite code does not exist", () => {
      const dto = createMockUserData();
      (inviteCodeRepository as InviteCodeRepository).findInviteCode = jest
        .fn()
        .mockResolvedValue(null);

      return expect(
        userService.createUser(provider, providerId, dto)
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.INVALID_INVITE_CODE,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should throw error when the invite code was already used by other user", () => {
      const dto = createMockUserData();
      (inviteCodeRepository as InviteCodeRepository).findInviteCode = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          code: "test-invite-code",
          owner: createMockDbUserPreview(),
          issuedAt: new Date(),
          usedBy: createMockDbUserPreview(),
          usedAt: new Date(),
        });

      return expect(
        userService.createUser(provider, providerId, dto)
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.INVALID_INVITE_CODE,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should create user successfully", async () => {
      const dto = createMockUserData();
      (inviteCodeRepository as InviteCodeRepository).findInviteCode = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          code: "test-invite-code",
          owner: createMockDbUserPreview(),
          issuedAt: new Date(),
          usedBy: null,
          usedAt: null,
        });
      (userRepository as UserRepository).createUser = jest
        .fn()
        .mockResolvedValue(createMockDbUser());

      const result = await userService.createUser(provider, providerId, dto);

      expect((userRepository as UserRepository).createUser).toBeCalled();
      expect(result).not.toBeNull();
    });
  });

  describe("validateHandle", () => {
    it("should throw error when the handle exists", () => {
      const handle = "test-handle";
      (userRepository as UserRepository).findUserByHandle = jest
        .fn()
        .mockResolvedValue(createMockDbUser());

      return expect(userService.validateHandle(handle)).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.HANDLE_EXISTS,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should validate handle successfully", async () => {
      const handle = "test-handle";
      (userRepository as UserRepository).findUserByHandle = jest
        .fn()
        .mockResolvedValue(null);

      return expect(userService.validateHandle(handle)).resolves.not.toThrow();
    });
  });

  describe("validateInviteCode", () => {
    it("should throw error when the invite code does not exist", () => {
      const inviteCode = "test-invite-code";
      (inviteCodeRepository as InviteCodeRepository).findInviteCode = jest
        .fn()
        .mockResolvedValue(null);

      return expect(userService.validateInviteCode(inviteCode)).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.INVALID_INVITE_CODE,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should throw error when the invite code was already used", () => {
      const inviteCode = "test-invite-code";
      (inviteCodeRepository as InviteCodeRepository).findInviteCode = jest
        .fn()
        .mockResolvedValue({
          id: 1,
          code: "test-invite-code",
          owner: createMockDbUserPreview(),
          issuedAt: new Date(),
          usedBy: createMockDbUserPreview(),
          usedAt: new Date(),
        });

      return expect(userService.validateInviteCode(inviteCode)).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.INVALID_INVITE_CODE,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });
  });

  describe("followUser", () => {
    it("should throw error when the user is not activated", () => {
      const userId = "test-user-id";
      const followingUserId = "test-following-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({ id: followingUserId, isActivated: false })
        );

      return expect(
        userService.followUser(userId, followingUserId)
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.ACCOUNT_NOT_ACTIVATED,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should follow user successfully when the following user is activated", async () => {
      const userId = "test-user-id";
      const followingUserId = "test-following-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({ id: followingUserId, isActivated: true })
        );

      await userService.followUser(userId, followingUserId);

      expect(
        (followingRecordRepository as FollowingRecordRepository)
          .createFollowingRecord
      ).toBeCalled();
    });
  });

  describe("unfollowUser", () => {
    it("should throw error when the following user is not activated", () => {
      const userId = "test-user-id";
      const followingUserId = "test-following-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({ id: followingUserId, isActivated: false })
        );

      return expect(
        userService.unfollowUser(userId, followingUserId)
      ).rejects.toThrow(
        expect.objectContaining({
          errorCode: ErrorCode.ACCOUNT_NOT_ACTIVATED,
          status: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it("should unfollow user successfully when the following user is activated", async () => {
      const userId = "test-user-id";
      const followingUserId = "test-following-user-id";
      (userRepository as UserRepository).findUserById = jest
        .fn()
        .mockResolvedValue(
          createMockDbUser({ id: followingUserId, isActivated: true })
        );

      await userService.unfollowUser(userId, followingUserId);

      expect(
        (followingRecordRepository as FollowingRecordRepository)
          .deleteFollowingRecord
      ).toBeCalled();
    });
  });
});
