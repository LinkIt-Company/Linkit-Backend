export type AiClassificationFunctionResult = {
  summary: string;
  keywords: string[];
  category: string;
};

export function summarizeURLContentFunctionFactory(folderList: string[]) {
  return {
    name: 'summarizeURL',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
        },
        keywords: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        category: {
          type: 'string',
          enum: folderList,
        },
      },
      required: ['summary', 'keywords', 'category'],
    },
  };
}

export const getKeywordsFromURLContentFunction = {
  name: 'summarizeURL',
  parameters: {
    type: 'object',
    properties: {
      summary: {
        type: 'string',
      },
      keywords: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    required: ['summary', 'keywords', 'category'],
  },
};
