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
async function createLanguageWeeklyTrending(language, songs) {
  // sort songs based on the calculated score in descending order
  const dictLanguage = langdict[language];
  const languageSongs = songs.filter(
    (item) => item.language === dictLanguage
  );

  if (languageSongs.length === 0) {
    console.log(`No ${language} songs found in the last 7 days`);
    return;
  }

  console.log(`Found ${languageSongs.length} ${language} songs in the last 7 days`);
  languageSongs.sort((a, b) => {
    const scoreA = a.praiseCount * 0.7 + a.playCount * 0.3;
    const scoreB = b.praiseCount * 0.7 + b.playCount * 0.3;
    return scoreB - scoreA;
  });

  // create a new playlist for the weekly trending songs
  const now = new Date();
  const currentWeek = getWeek(now);
  const weeklySongs = languageSongs.slice(0, 50);
  const playlist = new SongPlaylist({
    name: `${language} Trending ${now.getFullYear()}-${currentWeek}`,
    description: "Weekly trending songs",
    type: "playlist",
    explicitContent: false,
    songCount: weeklySongs.length,
    language: dictLanguage,
    isModule: false,
    url: "",
    image: [
      {
        quality: "150x150",
        url: weeklySongs[0]?.image[0]?.url,
      },
    ],
    isWeekly: true,
    songs: weeklySongs.map((song) => song._id),
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

    const currentDate = new Date();
    const sevenDaysAgo = new Date(
      currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    // find all songs that were updated in the last 7 days
    const songs = await Song.find({
      updateDate: { $gte: sevenDaysAgo },
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

    console.log("Created Weekly Trending playlist");

    await createLanguageWeeklyTrending("English", songs);
    await createLanguageWeeklyTrending("Russian", songs);
    await createLanguageWeeklyTrending("Chinese", songs);

  } catch (error) {
    console.error(`Failed to connect to db: ${error.message}`);
  }
  console.log("========== create weekly list end ==========");
}

export default createWeeklyTrending;
