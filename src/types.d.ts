type Address = string;

type Post = {
  id: number;
  from: Address;
  contents: string;
  image: string;
  createdAt: number;
  likesCount: number;
  commentsCount: number;
  dislikesCount: number;
  weight: number;
  liked: boolean;
  disliked: boolean;
  flagged: boolean;
};
