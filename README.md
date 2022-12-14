# Themoviedb movie image downloader

This is a simple script to download movie images from themoviedb.org. It uses the API to get the movie information and
then downloads the images.

## Features

* Download trending movie images from themoviedb.org

## Usage

`node index.js`

Image files will be downloaded to the `download` directory.

Update the `end_page` variable in the index.js file to set the end page to download.

## Configuration

copy `.env.example` to `.env` and edit the values.

update the `API_KEY` with your own API key from [themoviedb.org](https://www.themoviedb.org/) v3 API.

