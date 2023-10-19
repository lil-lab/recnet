import axios from "axios";

export async function getUserByEmail(email) {
  const getUserResponse = await axios.get(
    `/api/user/getUserByEmail?email=${email}`
  );

  if (getUserResponse.status === 200) {
    // User exists, return the user; otherwise return undefined
    return getUserResponse.data;
  }
}

export async function getUserById(id) {
  const getUserResponse = await axios.get(`/api/user/getUserById?id=${id}`);

  if (getUserResponse.status === 200) {
    // User exists, return the user; otherwise return undefined
    return getUserResponse.data;
  }
}

export async function addUser(user) {
  const addUserResponse = await axios.post("/api/user/addUser", user);

  if (addUserResponse.status === 200) {
    return addUserResponse.data;
  }
}

export async function followUser(id, currentUserId) {
  const response = await axios.post("/api/user/follow", { id, currentUserId });

  if (response.status === 200) {
    return response.data;
  }
}

export async function unfollowUser(id, currentUserId) {
  const response = await axios.post("/api/user/unfollow", {
    id,
    currentUserId,
  });

  if (response.status === 200) {
    return response.data;
  }
}

export async function searchUsers(emailOrName) {
  const response = await axios.get(`/api/user/search?q=${emailOrName}`);

  console.log(response.data);
  if (response.status === 200) {
    return response.data;
  }
}
