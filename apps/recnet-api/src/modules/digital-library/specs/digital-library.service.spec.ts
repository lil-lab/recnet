import { Request } from "express";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";

import { ArXivService } from "../arxiv.service";
import { DIGITAL_LIBRARY_ID } from "../digital-library.const";
import { DigitalLibraryServiceFactory } from "../digital-library.service";

describe("DigitalLibraryServiceFactory", () => {
  let digitalLibraryRepository: DigitalLibraryRepository;
  let req: Request;

  beforeEach(() => {
    digitalLibraryRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as DigitalLibraryRepository;

    req = {
      originalUrl: "",
      method: "",
      query: {},
    } as Request;
  });

  it("should return null if the API endpoint is not GET /article", async () => {
    req.originalUrl = "/not-article";
    req.method = "POST";

    const result = await DigitalLibraryServiceFactory(
      digitalLibraryRepository,
      req
    );
    expect(result).toBeNull();
  });

  it("should return null if link is null", async () => {
    req.originalUrl = "/article";
    req.method = "GET";
    req.query = { link: null };

    const result = await DigitalLibraryServiceFactory(
      digitalLibraryRepository,
      req
    );
    expect(result).toBeNull();
  });

  it("should return null if no matching library is found", async () => {
    req.originalUrl = "/article";
    req.method = "GET";
    req.query = { link: "https://example.com" };

    (digitalLibraryRepository.findAll as jest.Mock).mockResolvedValue([]);

    const result = await DigitalLibraryServiceFactory(
      digitalLibraryRepository,
      req
    );
    expect(result).toBeNull();
  });

  it("should return ArXivService if matching library is found with arXiv ID", async () => {
    req.originalUrl = "/article";
    req.method = "GET";
    req.query = { link: "https://arxiv.org/abs/1234.5678" };

    (digitalLibraryRepository.findAll as jest.Mock).mockResolvedValue([
      {
        id: DIGITAL_LIBRARY_ID.arXiv,
        regex: ["https?://arxiv.org/(abs|pdf)/[0-9.]+"],
      },
    ]);

    const result = await DigitalLibraryServiceFactory(
      digitalLibraryRepository,
      req
    );
    expect(result).toBeInstanceOf(ArXivService);
  });

  it("should return null if matching library is found but ID is not arXiv", async () => {
    req.originalUrl = "/article";
    req.method = "GET";
    req.query = { link: "https://example.com" };

    (digitalLibraryRepository.findAll as jest.Mock).mockResolvedValue([
      {
        id: "some-other-id",
        regex: ["https?://example.com"],
      },
    ]);

    const result = await DigitalLibraryServiceFactory(
      digitalLibraryRepository,
      req
    );
    expect(result).toBeNull();
  });
});
