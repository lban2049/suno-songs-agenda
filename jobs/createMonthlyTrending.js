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

async function createMonthlyTrending() {
  console.log("========== create monthly list start ==========");
  try {
    const mongoUrl = process.env.MONGODB_URL;
    const mongoDb = process.env.DB_NAME;
    await mongoose.connect(mongoUrl, {
      dbName: mongoDb,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("connected to db");

    // find top 100 songs
    const monthSongs = await Song.find({})
      .sort({ rankValue: -1 }).limit(100).exec();

    if (monthSongs.length === 0) {
      console.log(`No songs found `);
      return;
    }

    console.log(`Found ${monthSongs.length} songs`);

    console.log("Created Monthly Trending playlist");

    // create a new playlist for the weekly trending songs
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const playlist = new SongPlaylist({
      name: `Monthly Trending ${now.getFullYear()}-${currentMonth}`,
      description: "Monthly trending songs",
      type: "playlist",
      explicitContent: false,
      songCount: monthSongs.length,
      isModule: false,
      url: "",
      image: [
        {
          quality: "150x150",
          url: monthSongs[0]?.image[0]?.url,
        },
      ],
      isMonthly: true,
      songs: monthSongs.map((song) => song._id),
      artists: [],
    });

    await playlist.save();
  } catch (error) {
    console.error(`create monthly list error: ${error.message}`);
  }

  console.log("========== create monthly list end ==========");
}

export default createMonthlyTrending;
