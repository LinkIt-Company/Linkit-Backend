// Do not import 'tiktoken'
import { encodingForModel } from 'js-tiktoken';
import { gptVersion } from '@src/infrastructure/ai/ai.constant';
import { summarizeURLContentFunctionFactory } from '@src/infrastructure/ai/functions';

const encoder = encodingForModel(gptVersion);

// Reference: https://platform.openai.com/docs/advanced-usage/managing-tokens
// 주의: 실제 Open AI랑 약간의 오차 존재
export function promptTokenCalculator(content: string, folderList: string[]) {
  let tokenCount = 0;

  // Prompt Calculation
  const messages = [
    {
      role: 'system',
      content: '한글로 답변 부탁해',
    },
    {
      role: 'user',
      content: `주어진 글에 대해 요약하고 키워드 추출, 분류 부탁해

${content}
      `,
    },
  ];
  for (const message of messages) {
    // Message struct Overhead
    tokenCount += 4;
    tokenCount += encoder.encode(message.role).length;
    tokenCount += encoder.encode(message.content).length;
  }
  tokenCount += 2;

  // Function Calculation
  tokenCount += encoder.encode(
    JSON.stringify(summarizeURLContentFunctionFactory(folderList)),
  ).length;
  return tokenCount;
}
