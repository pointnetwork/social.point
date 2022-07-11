export default function getPostData(post: any[]): Post {
  const [
    id,
    from,
    contents,
    image,
    createdAt,
    likesCount,
    commentsCount,
    dislikesCount,
    liked,
    disliked,
    weight,
    flagged,
  ] = post;

  return {
    id: parseInt(id, 10),
    from,
    contents,
    image,
    createdAt: createdAt * 1000,
    likesCount: parseInt(likesCount, 10),
    dislikesCount: parseInt(dislikesCount, 10),
    commentsCount: parseInt(commentsCount, 10),
    liked: !!liked,
    disliked: !!disliked,
    weight: parseInt(weight, 10),
    flagged: !!flagged,
  };
}
