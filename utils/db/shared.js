import axios from "axios";

export async function post(route, body) {
  try {
    const response = await axios.post(route, body);
    return response;
  } catch (error) {
    return { error: error.response.data };
  }
}

export async function get(route) {
  try {
    const response = await axios.get(route);
    return response;
  } catch (error) {
    return { error: error.response.data };
  }
}
