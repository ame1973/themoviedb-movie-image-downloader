import API from "./services/api.js";
import * as dotenv from "dotenv";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

const imageBaseUrl = "https://image.tmdb.org/t/p/original";

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getTrending = async (page = 1) => {
  const media_type = "movie";
  const time_window = "week";

  const response = await API.get("trending/" + media_type + "/" + time_window, {
    params: {
      api_key: process.env.API_KEY,
      page: page,
    },
  });

  return response.data;
};

const getMovieImage = async (movie_id) => {
  const response = await API.get("movie/" + movie_id + "/images", {
    params: {
      api_key: process.env.API_KEY,
      language: "zh",
    },
  });

  return response.data;
};

let page = 1;
let end_page = 50;

while (page <= end_page) {
  sleep(500);
  const trending_data = await getTrending(page + 1);
  if (trending_data.total_pages < end_page) {
    end_page = trending_data.total_pages;
  }
  page = trending_data.page;

  const trending_record = trending_data.results;

  trending_record.map(async (item) => {
    const movie_id = item.id;
    const title = slugify(item.title);
    console.log("[INFO] movie loaded: " + item.title + " " + movie_id);

    const image_data = await getMovieImage(movie_id);

    if (image_data.posters.length > 0) {
      const poster_path = image_data.posters[0].file_path ?? null;

      if (poster_path) {
        const url = imageBaseUrl + poster_path;
        const filename = title + ".jpg";

        const download_path = path.join(process.cwd(), "download", filename);

        if (!fs.existsSync(download_path)) {
          const result = await axios(
            {
              method: "get",
              url: url,
              responseType: "stream",
            },
            {
              headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
          ).then(function (response) {
            console.log("[DOWNLOAD] ", download_path);
            response.data.pipe(fs.createWriteStream(download_path));
            console.log("[SUCCESS] Download: ", download_path);
            sleep(1000);
          });
        } else {
          console.log("[INFO] Image already exists: " + download_path);
        }
      } else {
        console.log("[INFO] poster_path not found");
      }
    } else {
      console.log("[INFO] No poster found: " + title);
    }
  });
  console.log("[INFO] Page: " + page + " of " + end_page);
}
