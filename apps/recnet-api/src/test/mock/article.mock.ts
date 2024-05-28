import { Article as DbArticle } from "@recnet-api/database/repository/article.repository.type";

export const createMockDbArticle = (
  dbArticle?: Partial<DbArticle>
): DbArticle => {
  return {
    id: "30a38241-19ea-4702-b847-b6b832b6d4e9",
    title: "Test Article",
    doi: "10.1145/123456",
    author: "Test Author",
    link: "https://example.com/test-article",
    year: 2024,
    month: 1,
    isVerified: false,
    ...dbArticle,
  };
};
