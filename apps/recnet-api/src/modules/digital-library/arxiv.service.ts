import { Injectable } from "@nestjs/common";
import axios from "axios";

import { DigitalLibraryService } from "./digital-library.service";
import { Metadata } from "./entities/metadata.entity";

@Injectable()
export class ArXivService implements DigitalLibraryService {
  public async getMetadata(url: string): Promise<Metadata> {
    try {
      const response = await axios.get(
        "https://export.arxiv.org/api/query?id_list=2406.11741"
      );
      console.log(response);

      // Here you would parse the response to extract the metadata
      // This is a placeholder, you'll need to adjust based on the actual response structure
      const metadata: Metadata = {
        title: "Placeholder Title",
        author: "Placeholder Author",
        link: url,
        // Add other fields as necessary
      };

      return metadata;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw new Error("Failed to fetch metadata");
    }
  }
}
