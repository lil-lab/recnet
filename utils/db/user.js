import axios from "axios";

export async function getUserByEmail(email) {
  const getUserResponse = await axios.get(
    `/api/user/getUserByEmail?email=${email}`
  );

  if (getUserResponse.status === 200) {
    // User exists, return the user; otherwise return undefined
    const user = getUserResponse.data;
    return user;
  }
}

export async function getUserById(id) {
  const getUserResponse = await axios.get(`/api/user/getUserById?id=${id}`);

  if (getUserResponse.status === 200) {
    // User exists, return the user; otherwise return undefined
    const user = getUserResponse.data;
    return user;
  }
}

export async function addUser(user) {
  const addUserResponse = await axios.post("/api/user/addUser", user);

  if (addUserResponse.status === 200) {
    const user = addUserResponse.data;
    return user;
  }
}

export async function followUser(id, currentUserId) {
  const response = await axios.post("/api/user/follow", { id, currentUserId });

  if (response.status === 200) {
    return response.data;
  }
}

export async function unfollowUser(id, currentUserId) {
  const response = await axios.post("/api/user/unfollow", { id, currentUserId });

  if (response.status === 200) {
    return response.data;
  }
}
