import { HttpStatus } from "@nestjs/common";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { ArXivService } from "../arxiv.service";
import { DIGITAL_LIBRARY_ID } from "../digital-library.const";

jest.mock("axios");
jest.mock("fast-xml-parser");

describe("ArXivService", () => {
  let service: ArXivService;
  let digitalLibraryRepository: DigitalLibraryRepository;

  beforeEach(() => {
    digitalLibraryRepository = {
      findById: jest.fn().mockResolvedValue({
        id: DIGITAL_LIBRARY_ID.arXiv,
        name: "arXiv",
        regex: ["https?://arxiv.org/(abs|pdf)/(?<id>[0-9.]+(v[0-9]+)?)"],
        isVerified: true,
      }),
      findAll: jest.fn(),
    } as unknown as DigitalLibraryRepository;

    service = new ArXivService(digitalLibraryRepository);
  });

  describe("getMetadata", () => {
    it("should return metadata successfully with single authors", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><title>Sample Title</title><author><name>Author Name</name></author><published>2023-09-18T00:00:00Z</published></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            title: "Sample Title",
            author: { name: "Author Name" },
            published: "2023-09-18T00:00:00Z",
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;
      const metadata = await service.getMetadata(link);

      expect(metadata.title).toEqual("Sample Title");
      expect(metadata.author).toEqual("Author Name");
      expect(metadata.year).toEqual(2023);
      expect(metadata.month).toEqual(8); // Months are 0-indexed
      expect(metadata.isVerified).toEqual(true);
    });

    it("should return metadata successfully with multiple authors", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><title>Sample Title</title><author><name>Author 1</name></author><author><name>Author 2</name></author><published>2023-09-18T00:00:00Z</published></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            title: "Sample Title",
            author: [{ name: "Author 1" }, { name: "Author 2" }],
            published: "2023-09-18T00:00:00Z",
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;
      const metadata = await service.getMetadata(link);

      expect(metadata.author).toEqual("Author 1, Author 2");
    });

    it("should throw an error if arXiv ID is not found", async () => {
      const mockArXivId = "invalidLink";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to find arXiv ID: ${link}`
        )
      );
    });

    it("should throw an error if arXiv metadata fetch fails", async () => {
      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      (axios.get as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to fetch arXiv metadata: Network error"
        )
      );
    });

    it("should throw an error if arXiv response is invalid", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><title>Error</title><summary>Invalid arXiv response</summary></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            title: "Error",
            summary: "Invalid arXiv response",
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Parsed arXiv response Error: Invalid arXiv response"
        )
      );
    });

    it("should throw an error if arXiv response does not contain title", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><published>2023-09-18T00:00:00Z</published></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            published: "2023-09-18T00:00:00Z",
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to find title in arXiv response"
        )
      );
    });

    it("should throw an error if arXiv response does not contain author", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><title>Sample Title</title><published>2023-09-18T00:00:00Z</published></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            title: "Sample Title",
            published: "2023-09-18T00:00:00Z",
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to find author in arXiv response"
        )
      );
    });

    it("should throw an error if arXiv response does not contain publish date", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: "<xml><feed><entry><title>Sample Title</title><author><name>Author 1</name></author></entry></feed></xml>",
      });

      (XMLParser.prototype.parse as jest.Mock).mockReturnValue({
        feed: {
          entry: {
            title: "Sample Title",
            author: { name: "Author 1" },
          },
        },
      });

      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/abs/${mockArXivId}`;

      await expect(service.getMetadata(link)).rejects.toThrow(
        new RecnetError(
          ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to find publish date in arXiv response"
        )
      );
    });
  });

  describe("getUnifiedLink", () => {
    it("should return the correct unified link", async () => {
      const mockArXivId = "2409.11377v1";
      const link = `https://arxiv.org/pdf/${mockArXivId}`;
      const unifiedLink = await service.getUnifiedLink(link);

      expect(unifiedLink).toEqual(`https://arxiv.org/abs/${mockArXivId}`);
    });
  });
});
