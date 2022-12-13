import axios from "axios";

const API = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Encoding": "gzip,deflate,compress",
  },
  timeout: 5000,
});

export default API;
