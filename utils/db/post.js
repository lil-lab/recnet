import { post, get, del, put } from "./shared";

export const postEntry = async (
  title,
  link,
  author,
  description,
  email,
  year,
  month,
  userId
) => {
  // check if there's post in progress
  const { data, error } = await getPostInProgressByUser(userId);
  if (error) {
    // error getting post in progress
    return { error };
  } else {
    if (data) return { error: "Already have post in progress." };

    return await post("/api/post/postEntry", {
      title,
      link,
      author,
      description,
      email,
      year,
      month,
      userId,
    });
  }
};

export const getPostInProgressByUser = async (userId) => {
  return await get(`/api/post/getPostInProgressByUser?userId=${userId}`);
};

export const getPostById = async (postId) => {
  return await get(`/api/post/getPostById?postId=${postId}`);
};

export const updatePost = async (
  title,
  link,
  author,
  description,
  year,
  month,
  postId
) => {
  return await put("/api/post/updatePost", {
    title,
    link,
    author,
    description,
    year,
    month,
    postId,
  });
};

export const getPostsByUser = async (userId, includeCurrentCutoff) => {
  const route =
    `/api/post/getPostsByUser?userId=${userId}` +
    `&includeCurrentCutoff=${includeCurrentCutoff}`;
  return await get(route);
};

export const getFollowingPostsByDate = async (userId, date) => {
  const route =
    `/api/post/getFollowingPostsByDate?userId=${userId}` +
    `&cutoff=${date.getTime()}`;
  return await get(route);
};

export const deletePost = async (postId) => {
  return await del(`/api/post/deletePost?postId=${postId}`);
};
