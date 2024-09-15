import { Metadata } from "./entities/metadata.entity";

export interface DigitalLibraryService {
  getMetadata(url: string): Promise<Metadata>;
}
