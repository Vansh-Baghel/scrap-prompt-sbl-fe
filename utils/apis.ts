import axios from "axios";
import { API_URL } from "./config";

export async function createTask({
  url,
  question,
}: {
  url: string;
  question: string;
}) {
  const resp = await axios.post(`${API_URL}/tasks`, { url, question });
  return resp.data;
}

export async function getAllTasks() {
  const res = await axios.get(`${API_URL}/tasks`);
  return res.data;
}
