export enum OpenAIPlatform {
  azure = 'azure',
  openai = 'openai',
}

export type SummarizeURLContent = {
  summary: string;
  keywords: string[];
  category: string;
};
