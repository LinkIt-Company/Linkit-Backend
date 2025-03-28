export type AiClassificationPayload = {
  postContent: string;
  postThumbnailContent: string;
  folderList: { id: string; name: string }[];
  userId: string;
  postId: string;
  url: string;
};
