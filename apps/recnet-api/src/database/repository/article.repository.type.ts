import { Prisma } from "@prisma/client";

export const article = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  select: {
    id: true,
    title: true,
    doi: true,
    author: true,
    link: true,
    year: true,
    month: true,
    abstract: true,
    isVerified: true,
  },
});
export type Article = Prisma.ArticleGetPayload<typeof article>;

export type CreateArticleInput = Omit<
  Article,
  "id" | "isVerified" | "abstract"
> & {
  abstract?: string;
  isVerified?: boolean;
};
