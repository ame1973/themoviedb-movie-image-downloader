import API from "./services/api.js";
import * as dotenv from "dotenv";
import axios from "axios";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

const imageBaseUrl = "https://image.tmdb.org/t/p/original";

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

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

while (page <= 10) {
  const trending_data = await getTrending(page + 1);
  page = trending_data.page;

  const trending_record = trending_data.results;

  trending_record.map(async (item) => {
    await timer(1000);
    const movie_id = item.id;
    console.log(item.title);

    const image_data = await getMovieImage(movie_id);

    if (image_data.posters.length > 0) {
      const poster_path = image_data.posters[0].file_path ?? null;

      if (poster_path) {
        const url = imageBaseUrl + poster_path;
        const filename = item.title + ".jpg";

        const download_path = path.join(process.cwd(), "download", filename);

        if (!fs.existsSync(download_path)) {
          axios(
            {
              method: "get",
              url: url,
              responseType: "stream",
            },
            {
              headers: { "Accept-Encoding": "gzip,deflate,compress" },
            }
          ).then(function (response) {
            console.log("download_path", download_path);
            response.data.pipe(fs.createWriteStream(download_path));
          });
        } else {
          console.log(download_path + " already exist");
        }
      } else {
        console.log(image_data.posters[0]);
      }
    }
  });
}
