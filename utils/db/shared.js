import axios from "axios";
import { getCurrentUser } from "./auth";

export async function post(route, body) {
  try {
    const currentUser = await getCurrentUser();
    console.log(currentUser);
    let response;
    if (currentUser) {
      response = await axios.post(route, body, {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` },
      });
    } else {
      response = await axios.post(route, body);
    }

    return response;
  } catch (error) {
    return { error: error.response.data };
  }
}

export async function get(route) {
  try {
    const currentUser = await getCurrentUser();
    let response;
    if (currentUser) {
      response = await axios.get(route, {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` },
      });
    } else {
      response = await axios.get(route);
    }

    return response;
  } catch (error) {
    console.log(error);
    return { error: error.response.data };
  }
}

export async function del(route) {
  try {
    const currentUser = await getCurrentUser();
    let response;
    if (currentUser) {
      response = await axios.delete(route, {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` },
      });
    } else {
      response = await axios.delete(route);
    }

    return response;
  } catch (error) {
    return { error: error.response.data };
  }
}
