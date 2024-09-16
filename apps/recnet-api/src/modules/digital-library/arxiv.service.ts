import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import get from "lodash.get";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { DigitalLibraryService } from "./digital-library.service";
import { Metadata } from "./entities/metadata.entity";

const API_ENDPOINT = "https://export.arxiv.org/api/query";

@Injectable()
export class ArXivService implements DigitalLibraryService {
  constructor(
    @Inject(DigitalLibraryRepository)
    private readonly digitalLibraryRepository: DigitalLibraryRepository,
    private readonly digitalLibraryId: number
  ) {}

  public async getMetadata(url: string): Promise<Metadata> {
    const arXivDL = await this.digitalLibraryRepository.findById(
      this.digitalLibraryId
    );
    const arXivId: string | null = await this.getArXivId(url, arXivDL.regex);

    if (!arXivId) {
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to find arXiv ID: ${url}`
      );
    }

    try {
      const { data } = await axios.get(`${API_ENDPOINT}?id_list=${arXivId}`);

      const metadata = this.parseXMLResponse(data);
      metadata.isVerified = arXivDL.isVerified;

      return metadata;
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

  private async getArXivId(url: string, regex: Array<string>) {
    let arXivId: string | null = null;
    for (const rg of regex || []) {
      const match = url.match(rg);
      if (match && match.groups) {
        arXivId = match.groups.id;
        break;
      }
    }
    return arXivId;
  }

  private parseXMLResponse(xmlData: string): Metadata {
    const parser = new XMLParser();
    const parsed: unknown = parser.parse(xmlData);

    const title: string = get(parsed, "feed.entry.title", "");
    if (title === "Error" || title.length === 0) {
      const errMsg = get(parsed, "feed.entry.summary", "");
      throw new RecnetError(
        ErrorCode.FETCH_DIGITAL_LIBRARY_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Parsed arXiv response Error: ${errMsg}`
      );
    }
    const metadata: Metadata = { title };

    const authors: Array<{ name: string }> | { name: string } | null = get(
      parsed,
      "feed.entry.author",
      null
    );
    if (Array.isArray(authors)) {
      metadata.author = (authors as Array<{ name: string }>)
        .map((obj: { name: string }) => obj.name)
        .join(", ");
    } else if (authors !== null) {
      metadata.author = (authors as { name: string }).name;
    }

    metadata.link = get(parsed, "feed.entry.id");

    const publishDate = get(parsed, "feed.entry.published", null);
    if (publishDate) {
      const date = new Date(publishDate);
      metadata.year = date.getFullYear();
      metadata.month = date.getMonth();
    }

    return metadata;
  }
}
