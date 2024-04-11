import axios from "axios";
import Song from "../../src/models/song.js";
import mongoose from "mongoose";
import cheerio from "cheerio";
import SongPlaylist from "../../src/models/songplaylist.js";
import { getWeek } from "date-fns";

import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
// 网络代理，如不需要可删除
const httpAgent = new HttpProxyAgent("http://127.0.0.1:10808");
const httpsAgent = new HttpsProxyAgent("http://127.0.0.1:10808");

async function createMonthlyTrending() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    const mongoDb = process.env.DB_NAME;
    await mongoose.connect(mongoUrl, {
      dbName: mongoDb,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("connected to db");

    const currentDate = new Date();
    const monthDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // find all songs that were updated in the last 30 days
    const songs = await Song.find({
      updateDate: { $gte: monthDaysAgo },
    }).exec();

    if (songs.length === 0) {
      console.log("No songs found in the last 7 days");
      return;
    }

    console.log(`Found ${songs.length} songs in the last 7 days`);

    // update praise count for each song
    for (const song of songs) {
      try {
        const id = song.url.substring(
          song.url.lastIndexOf("/") + 1,
          song.url.lastIndexOf(".mp3")
        );
        console.log(`Fetching song ${song.name} with id ${id}`);
        const songUrl = `https://suno.com/song/${id}/`;
        const response = await axios.get(songUrl, {
          // httpAgent,
          // httpsAgent,
        });
        const $ = cheerio.load(response.data);
        const playCountNode = $("p.css-pms8ea");
        const praiseCount = playCountNode.first().text().trim();

        song.praiseCount = praiseCount;
        await song.save();

        console.log(`Updated song ${song.name} with ${praiseCount} likes`);
      } catch (error) {
        console.error(`Failed to update song ${song.name}: ${error.message}`);
      }
    }

    console.log("Created Monthly Trending playlist");

    const monthSongs = songs.slice(0, 100);
    monthSongs.sort((a, b) => {
      const scoreA = a.praiseCount * 0.7 + a.playCount * 0.3;
      const scoreB = b.praiseCount * 0.7 + b.playCount * 0.3;
      return scoreB - scoreA;
    });

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
      songs: monthSongs.map((song) => song._id),
      artists: [],
    });

    await playlist.save();

    console.log("Monthly Trending playlist created successfully");
  } catch (error) {
    console.error(`Failed to connect to db: ${error.message}`);
  }
}

export default createMonthlyTrending;
