import * as cheerio from 'cheerio';

/**
 *
 * HTML Parser Utility Function.
 *
 * Parse Content and Title
 */
export async function parseLinkTitleAndContent(url: string): Promise<{
  title: string;
  content: string;
}> {
  const fetchTest = await fetch(url);
  const fetchHTML = await fetchTest.text();
  const $ = cheerio.load(fetchHTML);
  // HTML Element의 title
  const title = $('title').text();

  // HTML Body내에 있는 script태그랑 css style태그 제거
  $('body script, body style').remove();
  // HTML Element의 body의 text content
  const content = $('body')
    .text()
    .replace(/[\n\t\r]+/g, ' ')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
  return {
    title,
    content,
  };
}
