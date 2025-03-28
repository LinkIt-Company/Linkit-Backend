import { Post } from '@src/infrastructure';

export interface PostUpdateableFields
  extends Pick<Post, 'title' | 'isFavorite' | 'readAt' | 'thumbnailImgUrl'> {}
