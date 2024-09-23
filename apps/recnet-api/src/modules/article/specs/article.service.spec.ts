import ArticleRepository from "@recnet-api/database/repository/article.repository";
import { DigitalLibraryService } from "@recnet-api/modules/digital-library/digital-library.service";
import { Metadata } from "@recnet-api/modules/digital-library/entities/metadata.entity";

import { GetArticleByLinkResponse } from "../article.response";
import { ArticleService } from "../article.service";

describe("ArticleService", () => {
  let service: ArticleService;
  let articleRepository: ArticleRepository;
  let digitalLibraryService: DigitalLibraryService;

  beforeEach(() => {
    articleRepository = {
      findArticleByLink: jest.fn(),
      createArticle: jest.fn(),
    } as unknown as ArticleRepository;

    digitalLibraryService = {
      getUnifiedLink: jest.fn(),
      getMetadata: jest.fn(),
    } as unknown as DigitalLibraryService;
  });

  it("should return article if digitalLibraryService is null and link is found in the database", async () => {
    const link = "https://example.com/article";
    const article = { id: 1, link, title: "Test Article" };

    (articleRepository.findArticleByLink as jest.Mock).mockResolvedValue(
      article
    );
    service = new ArticleService(articleRepository, null);

    const result: GetArticleByLinkResponse =
      await service.getArticleByLink(link);
    expect(result.article).toEqual(article);
    expect(articleRepository.findArticleByLink).toHaveBeenCalledWith(link);
  });

  it("should return article if digitalLibraryService is available and unified link is found in the database", async () => {
    const link = "https://example.com/article";
    const unifiedLink = "https://example.com/unified-article";
    const article = { id: 1, link: unifiedLink, title: "Test Article" };

    (digitalLibraryService.getUnifiedLink as jest.Mock).mockResolvedValue(
      unifiedLink
    );
    (articleRepository.findArticleByLink as jest.Mock).mockResolvedValue(
      article
    );

    service = new ArticleService(articleRepository, digitalLibraryService);

    const result: GetArticleByLinkResponse =
      await service.getArticleByLink(link);
    expect(result.article).toEqual(article);
    expect(digitalLibraryService.getUnifiedLink).toHaveBeenCalledWith(link);
    expect(articleRepository.findArticleByLink).toHaveBeenCalledWith(
      unifiedLink
    );
  });

  it("should create and return article if metadata is found", async () => {
    const link = "https://example.com/article";
    const unifiedLink = "https://example.com/unified-article";
    const metadata: Metadata = {
      title: "Test Article",
      author: "Test Author",
      year: 2021,
      month: 5,
      isVerified: true,
    };
    const articleInput = {
      link: unifiedLink,
      doi: null,
      title: metadata.title,
      author: metadata.author,
      year: metadata.year,
      month: metadata.month,
      isVerified: metadata.isVerified,
    };
    const article = { id: 1, ...articleInput };

    (digitalLibraryService.getUnifiedLink as jest.Mock).mockResolvedValue(
      unifiedLink
    );
    (digitalLibraryService.getMetadata as jest.Mock).mockResolvedValue(
      metadata
    );
    (articleRepository.findArticleByLink as jest.Mock).mockResolvedValue(null);

    (articleRepository.createArticle as jest.Mock).mockResolvedValue(article);

    service = new ArticleService(articleRepository, digitalLibraryService);

    const result: GetArticleByLinkResponse =
      await service.getArticleByLink(link);
    expect(result.article).toEqual(article);
    expect(digitalLibraryService.getUnifiedLink).toHaveBeenCalledWith(link);
    expect(digitalLibraryService.getMetadata).toHaveBeenCalledWith(link);
    expect(articleRepository.createArticle).toHaveBeenCalledWith(articleInput);
  });

  it("should return null if no article found and fetch metadata error", async () => {
    const link = "https://example.com/article";
    const unifiedLink = "https://example.com/unified-article";
    (digitalLibraryService.getUnifiedLink as jest.Mock).mockResolvedValue(
      unifiedLink
    );
    (digitalLibraryService.getMetadata as jest.Mock).mockRejectedValue(
      new Error("Metadata fetch error")
    );
    (articleRepository.findArticleByLink as jest.Mock).mockResolvedValue(null);

    service = new ArticleService(articleRepository, digitalLibraryService);

    const result: GetArticleByLinkResponse =
      await service.getArticleByLink(link);
    expect(result.article).toBeNull();
    expect(articleRepository.findArticleByLink).toHaveBeenCalledWith(
      unifiedLink
    );
    expect(digitalLibraryService.getUnifiedLink).toHaveBeenCalledWith(link);
    expect(digitalLibraryService.getMetadata).toHaveBeenCalledWith(link);
  });
});
