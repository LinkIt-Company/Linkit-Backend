import { Injectable } from '@nestjs/common';
import { parseLinkTitleAndContent } from '@src/common';
import { AiService } from '@src/infrastructure/ai/ai.service';

@Injectable()
export class LaunchingEventsService {
  constructor(private readonly aiService: AiService) {}

  public async getResult(userKeywords: string, link: string) {
    const { content } = await parseLinkTitleAndContent(link);

    const { keywords } = await this.aiService.getKeywords(content);

    const userVector = await this.aiService.getKeywordEmbeddings(userKeywords);
    const extractedVectors = await Promise.all(
      keywords.map((k) => this.aiService.getKeywordEmbeddings(k)),
    );

    const result = extractedVectors.map(
      (v) => this.cosineSimilarity(userVector, v) * 100,
    );

    return result;
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce(
      (acc, val, i) => acc + val * vectorB[i],
      0,
    );
    const magnitudeA = Math.sqrt(
      vectorA.reduce((acc, val) => acc + val * val, 0),
    );
    const magnitudeB = Math.sqrt(
      vectorB.reduce((acc, val) => acc + val * val, 0),
    );
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
