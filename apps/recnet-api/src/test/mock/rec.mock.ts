import { Rec as DbRec } from "@recnet-api/database/repository/rec.repository.type";

import { createMockDbArticle } from "./article.mock";
import { createMockDbUserPreview } from "./user.mock";

export const createMockDbRec = (dbUser?: Partial<DbRec>): DbRec => ({
  id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
  description: "Test Rec",
  cutoff: new Date("2024-01-30T23:59:59.999Z"),
  user: createMockDbUserPreview(),
  article: createMockDbArticle(),
  ...dbUser,
});
