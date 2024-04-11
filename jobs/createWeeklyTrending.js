import axios from "axios";
import Song from "../models/song.js";
import mongoose from "mongoose";
import cheerio from "cheerio";
import SongPlaylist from "../models/songplaylist.js";
import { getWeek } from "date-fns";

import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
// 网络代理，如不需要可删除
const httpAgent = new HttpProxyAgent("http://127.0.0.1:10808");
const httpsAgent = new HttpsProxyAgent("http://127.0.0.1:10808");

const langdict = {
  Chinese: "cmn",
  English: "eng",
  Russian: "rus",
};

// create a new playlist for the weekly trending songs
async function createLanguageWeeklyTrending(language) {
  // sort songs based on the calculated score in descending order
  const dictLanguage = langdict[language];

  // find top 50 songs filter by language
  const languageSongs = await Song.find({ language: dictLanguage })
    .sort({ rankValue: -1 }).limit(50).exec();

  if (languageSongs.length === 0) {
    console.log(`No ${language} songs found `);
    return;
  }

  console.log(
    `Found ${languageSongs.length} ${language} songs`
  );

  // create a new playlist for the weekly trending songs
  const now = new Date();
  const currentWeek = getWeek(now);
  const playlist = new SongPlaylist({
    name: `${language} Trending ${now.getFullYear()}-${currentWeek}`,
    description: "Weekly trending songs",
    type: "playlist",
    explicitContent: false,
    songCount: languageSongs.length,
    language: dictLanguage,
    isModule: false,
    url: "",
    image: [
      {
        quality: "150x150",
        url: languageSongs[0]?.image[0]?.url,
      },
    ],
    isWeekly: true,
    songs: languageSongs.map((song) => song._id),
    artists: [],
  });

  await playlist.save();
  console.log(`Created ${language} Weekly Trending playlist`);
}

async function createWeeklyTrending() {
  console.log("========== create weekly list start ==========");

  try {
    const mongoUrl = process.env.MONGODB_URL;
    const mongoDb = process.env.DB_NAME;
    await mongoose.connect(mongoUrl, {
      dbName: mongoDb,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("connected to db");

    await createLanguageWeeklyTrending("English");
    await createLanguageWeeklyTrending("Russian");
    await createLanguageWeeklyTrending("Chinese");

  } catch (error) {
    console.error(`create weekly list error: ${error.message}`);
  }
  console.log("========== create weekly list end ==========");
}

export default createWeeklyTrending;
