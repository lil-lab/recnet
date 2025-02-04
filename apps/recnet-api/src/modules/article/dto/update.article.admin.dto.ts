import { ApiProperty } from '@nestjs/swagger';

export class AdminUpdateArticleDto {
  @ApiProperty({
    example: 'https://example.com/your-article-link',
    description: 'The URL link to the article.',
  })
  link?: string;

  @ApiProperty({
    example: 'How AI Is Transforming Healthcare',
    description: 'The title of the article.',
  })
  title?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The author of the article.',
  })
  author?: string;

  @ApiProperty({
    example: 2023,
    description: 'The publication year of the article.',
  })
  year?: number;

  @ApiProperty({
    example: 7,
    description: 'The publication month of the article (1-12).',
  })
  month?: number;

  @ApiProperty({
    example: '10.1234/abcd.efgh.2023',
    description: 'The DOI (Digital Object Identifier) of the article.',
  })
  doi?: string;

  @ApiProperty({
    example: 'This article explores how AI can be used to improve patient outcomes...',
    description: 'A brief abstract or summary of the article.',
  })
  abstract?: string;

  @ApiProperty({
    example: true,
    description: 'Verification status of the article.',
  })
  isVerified?: boolean;
}
