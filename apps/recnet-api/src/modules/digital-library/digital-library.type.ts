export type Metadata = {
  title: string;
  author: string;
  year: number;
  month: number;
  isVerified: boolean;
};

export type ArXivMetadata = Omit<Metadata, "isVerified">;
