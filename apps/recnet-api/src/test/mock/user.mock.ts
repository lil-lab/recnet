import {
  User as DbUser,
  UserPreview as DbUserPreview,
} from "@recnet-api/database/repository/user.repository.type";
import { User } from "@recnet-api/modules/user/entities/user.entity";
import { UserPreview } from "@recnet-api/modules/user/entities/user.preview.entity";

export const createMockUser = (user?: Partial<User>): User => ({
  id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
  handle: "testUser",
  displayName: "Test User",
  photoUrl: "https://photos.example.com/testUser.jpg",
  affiliation: "Cornell Tech",
  bio: null,
  url: null,
  googleScholarLink: null,
  semanticScholarLink: null,
  openReviewUserName: null,
  numFollowers: 10,
  numRecs: 2,
  email: "example@cornell.edu",
  role: "USER",
  isActivated: true,
  following: [
    {
      id: "598e5a58-fb12-40f7-840f-a64959c56d51",
      handle: "followedUser1",
      displayName: "Followed User 1",
      photoUrl: "https://photo.example.com/followedUser1.jpg",
      affiliation: "Cornell University",
      bio: null,
      url: null,
      numFollowers: 0,
      numRecs: 0,
    },
    {
      id: "7ca047c0-6faa-4003-9831-2adae3651955",
      handle: "followedUser2",
      displayName: "Followed User 2",
      photoUrl: "https://photo.example.com/followedUser2.jpg",
      affiliation: "Cornell University",
      bio: null,
      url: "",
      numFollowers: 28,
      numRecs: 13,
    },
  ],
  ...user,
});

export const createMockUserPreview = (
  userPreview?: Partial<UserPreview>
): UserPreview => ({
  id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
  handle: "testUser",
  displayName: "Test User",
  photoUrl: "https://photos.example.com/testUser.jpg",
  affiliation: "Cornell Tech",
  bio: null,
  url: null,
  numFollowers: 10,
  numRecs: 2,
  ...userPreview,
});

export const createMockDbUser = (dbUser?: Partial<DbUser>): DbUser => ({
  id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
  handle: "testUser",
  displayName: "Test User",
  photoUrl: "https://photos.example.com/testUser.jpg",
  affiliation: "Cornell Tech",
  bio: null,
  url: null,
  googleScholarLink: null,
  semanticScholarLink: null,
  openReviewUserName: null,
  followedBy: [],
  recommendations: [],
  email: "test@cornell.edu",
  role: "USER",
  isActivated: true,
  following: [],
  ...dbUser,
});

export const createMockDbUserPreview = (
  dbUserPreview?: Partial<DbUserPreview>
): DbUserPreview => ({
  id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
  handle: "testUser",
  displayName: "Test User",
  photoUrl: "https://photos.example.com/testUser.jpg",
  affiliation: "Cornell Tech",
  bio: null,
  url: null,
  followedBy: [],
  recommendations: [],
  ...dbUserPreview,
});
