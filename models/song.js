import mongoose from "mongoose";
import imageSchema from './image.js';

const songSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    year: Number,
    tags: String,
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    createDate: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
    label: String,
    explicitContent: Boolean,
    playCount: Number,
    language: String,
    hasLyrics: Boolean,
    lyricsId: String,
    isTrending: Boolean, // 为 true 时，显示在首页 Trending 列表
    trendingSortNo: {
      type: Number,
      default: 0,
    }, // 用于排序
    praiseCount: Number,
    lyrics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lyrics",
    },
    url: String,
    copyright: String,
    suggestionSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song",
      },
    ],
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "album",
    },
    artists: {
      primary: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "artist",
        },
      ],
      featured: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "artist",
        },
      ],
      all: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "artist",
        },
      ],
    },
    image: [imageSchema],
    downloadUrl: [
      {
        quality: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.song ||
  mongoose.model("song", songSchema, "song");
