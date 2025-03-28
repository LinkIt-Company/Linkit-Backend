import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

/**
 *
 * HTML Parser Utility Function.
 *
 * Parse Content and Title
 */
export async function parseLinkTitleAndContent(url: string): Promise<{
  title: string;
  content: string;
  thumbnail: string;
  thumbnailDescription: string;
}> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  let charset = 'utf-8';
  const htmlText = new TextDecoder(charset).decode(arrayBuffer);

  /**
   * Parse <meta charset as default
   *
   */
  const metaCharsetMatch = htmlText.match(
    /<meta\s+charset=["']?([^"'>]+)["']?/i,
  );
  if (metaCharsetMatch) {
    charset = metaCharsetMatch[1].toLowerCase().trim();
  } else {
    const metaContentTypeMatch = htmlText.match(
      /<meta\s+http-equiv=["']Content-Type["']\s+content=["'][^"']*charset=([^"';\s]+)["']/i,
    );
    if (metaContentTypeMatch) {
      charset = metaContentTypeMatch[1].toLowerCase().trim();
    }
  }

  let HTML;
  if (charset !== 'utf-8') {
    HTML = iconv.decode(Buffer.from(arrayBuffer), charset);
  } else {
    HTML = htmlText;
  }

  // HTML Cheerio Instance로 변환
  const $ = cheerio.load(HTML);
  // HTML Element의 title
  const title = $('title').text();
  // Page Thumbnail Parsing
  const thumbnail = $('meta[property="og:image"]').attr('content');
  // Page Thumbnail Description Parsing
  const thumbnailDescription = $('meta[property="og:description"]').attr(
    'content',
  );
  // HTML Body내에 있는 script태그랑 css style태그 제거
  $('body script, body style').remove();
  // HTML Element의 body의 text content
  const content = $('body')
    .text()
    .replace(/[\n\t\r]+/g, ' ')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
  return {
    title: title ? title : 'Page Title',
    content,
    thumbnail: sanitizeThumbnail(thumbnail),
    thumbnailDescription,
  };
}

function sanitizeThumbnail(thumbnail: string) {
  if (!thumbnail) {
    return '';
  }

  if (thumbnail.startsWith('//')) {
    return thumbnail.substring(2);
  }

  return thumbnail;
}
