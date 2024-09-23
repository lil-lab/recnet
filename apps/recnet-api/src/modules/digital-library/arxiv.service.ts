import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import get from "lodash.get";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { DIGITAL_LIBRARY_ID } from "./digital-library.const";
import { DigitalLibraryService } from "./digital-library.service";
import { ArXivMetadata, Metadata } from "./digital-library.type";

const API_ENDPOINT = "https://export.arxiv.org/api/query";
const ARXIV_UNIFIED_LINK = "https://arxiv.org/abs/";

@Injectable()
export class ArXivService implements DigitalLibraryService {
  constructor(
    @Inject(DigitalLibraryRepository)
    private readonly digitalLibraryRepository: DigitalLibraryRepository
  ) {}

  public async getMetadata(link: string): Promise<Metadata> {
    const arXivDL = await this.digitalLibraryRepository.findById(
      DIGITAL_LIBRARY_ID.arXiv
    );
    const arXivId: string = this.getArXivId(link, arXivDL.regex);

    try {
      const { data } = await axios.get(`${API_ENDPOINT}?id_list=${arXivId}`);

      const arXivMetadata = this.parseXMLResponse(data);

      return {
        ...arXivMetadata,
        isVerified: arXivDL.isVerified,
      };
    } catch (error) {
      if (error instanceof RecnetError) {
        throw error;
      }

      const errMsg = error instanceof Error ? error.message : "";
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to fetch arXiv metadata: ${errMsg}`
      );
    }
  }

  public async getUnifiedLink(link: string): Promise<string> {
    const arXivDL = await this.digitalLibraryRepository.findById(
      DIGITAL_LIBRARY_ID.arXiv
    );
    const arXivId: string = this.getArXivId(link, arXivDL.regex);
    return `${ARXIV_UNIFIED_LINK}${arXivId}`;
  }

  private getArXivId(link: string, regexPatterns: Array<string>): string {
    let arXivId: string | null = null;
    for (const pattern of regexPatterns) {
      const match = link.match(pattern);
      if (match && match.groups) {
        arXivId = match.groups.id;
        break;
      }
    }

    if (!arXivId) {
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to find arXiv ID: ${link}`
      );
    }

    return arXivId;
  }

  private parseXMLResponse(xmlData: string): ArXivMetadata {
    const parser = new XMLParser();
    const parsed: unknown = parser.parse(xmlData);

    const title: string | null = get(parsed, "feed.entry.title", null);
    if (title === "Error") {
      const errMsg = get(parsed, "feed.entry.summary", "");
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Parsed arXiv response Error: ${errMsg}`
      );
    } else if (title === null) {
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to find title in arXiv response`
      );
    }

    const authors: Array<{ name: string }> | { name: string } | null = get(
      parsed,
      "feed.entry.author",
      null
    );
    if (authors === null) {
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to find author in arXiv response`
      );
    }

    const publishDate = get(parsed, "feed.entry.published", null);
    if (publishDate === null) {
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to find publish date in arXiv response`
      );
    }

    const date = new Date(publishDate);

    const metadata: ArXivMetadata = {
      title,
      author: Array.isArray(authors)
        ? (authors as Array<{ name: string }>)
            .map((obj: { name: string }) => obj.name)
            .join(", ")
        : (authors as { name: string }).name,
      year: date.getFullYear(),
      month: date.getMonth(),
    };

    return metadata;
  }
}
