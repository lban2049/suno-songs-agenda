import axios from "axios";
import Song from "../models/song.js";
import Lyrics from "../models/lyrics.js";
import mongoose from "mongoose";

import { franc } from "franc";

// const LanguageDetect = require("languagedetect");
// const lngDetector = new LanguageDetect();

async function getDailyTrendingData() {
  try {
    console.log("========== get daily trending data start ==========");
    const mongoUrl = process.env.MONGODB_URL;
    const mongoDb = process.env.DB_NAME;
    await mongoose.connect(mongoUrl, {
      dbName: mongoDb,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("connected to db");

    // get daily trending data
    const url =
      "https://studio-api.suno.ai/api/playlist/1190bf92-10dc-4ce5-968a-7a377f37f984/?page=1";
    const res = await axios.get(url);

    if (res.status != 200) {
      console.error("get daily trending data failed");
      return;
    }

    if (!res.data || !res.data.playlist_clips) {
      console.error("get daily trending data failed, no data found");
      return;
    }

    // get song data
    for (let i = 0; i < res.data.playlist_clips.length; i++) {
      const clip = res.data.playlist_clips[i].clip;
      const createdAt = new Date(clip.created_at);

      const language = franc(clip.metadata.prompt);

      let rankValue = 0;
      if (clip.upvote_count !== undefined && clip.play_count !== undefined) {
        rankValue = clip.upvote_count * 0.7 + clip.play_count * 0.3;
      }


      const songId = clip.id;
      const songData = {
        name: clip.title,
        tags: clip.metadata.tags,
        type: "song",
        year: createdAt.getFullYear(),
        releaseDate: createdAt,
        label: clip.major_model_version,
        duration: Math.ceil(clip.metadata.duration),
        language,
        hasLyrics: true,
        isTrending: false,
        url: clip.audio_url,
        image: [
          {
            quality: "200x200",
            url: clip.image_url,
          },
        ],
        downloadUrl: [
          {
            quality: "high",
            url: clip.audio_url,
          },
        ],
        lyrics: {
          copyright: "",
          snippet: "",
          lyrics: clip.metadata.prompt,
        },
        praiseCount: clip.upvote_count,
        playCount: clip.play_count,
        rankValue,
        trendingSortNo: 10,
      };

      // check song exists
      const song = await Song.findOne({
        url: { $regex: songId, $options: "i" },
      });

      // console.log("song data:", songData);

      if (song) {
        // update song data
        await Song.updateOne(
          { _id: song._id },
          {
            playCount: songData.playCount,
            praiseCount: songData.praiseCount,
            rankValue: songData.rankValue,
            updateDate: new Date(),
          }
        );
        console.log("update song data:", songData.name);
      } else {
        // create song data
        const lyricsData = await Lyrics.create(songData.lyrics);
        songData.lyricsId = lyricsData._id;
        songData.lyrics = lyricsData._id;

        await Song.create(songData);

        console.log("create song data:", songData.name);
      }
    }

    await mongoose.connection.close();
    console.log("close db connection");
  } catch (error) {
    console.error("get daily trending data failed", error);
  }
  console.log("========== get daily trending data end ==========");
}

export default getDailyTrendingData;
