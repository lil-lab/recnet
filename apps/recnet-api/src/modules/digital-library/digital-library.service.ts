import { Request } from "express";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";

import { ArXivService } from "./arxiv.service";
import { DIGITAL_LIBRARY_ID } from "./digital-library.const";
import { Metadata } from "./entities/metadata.entity";

export interface DigitalLibraryService {
  getMetadata(link: string): Promise<Metadata>;
  getUnifiedLink(link: string): Promise<string>;
}

const shouldProvideService = (req: Request) => {
  return req.originalUrl.includes("article") && req.method === "GET";
};

export const DigitalLibraryServiceFactory = async (
  digitalLibraryRepository: DigitalLibraryRepository,
  req: Request
): Promise<DigitalLibraryService | null> => {
  if (!shouldProvideService(req)) {
    return null;
  }

  const { link } = req.query;
  if (typeof link !== "string") {
    return null;
  }

  const digitalLibraries = await digitalLibraryRepository.findAll();

  const matchingLibrary = digitalLibraries.find((library) =>
    library.regex.some((pattern) => new RegExp(pattern).test(link))
  );

  if (!matchingLibrary) {
    return null;
  }

  const matchId = matchingLibrary.id;
  if (matchId === DIGITAL_LIBRARY_ID.arXiv) {
    return new ArXivService(digitalLibraryRepository);
  }

  return null;
};
