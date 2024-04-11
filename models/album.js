import mongoose from "mongoose";
import imageSchema from './image.js';

const albumSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    description: String,
    year: Number,
    type: String,
    playCount: Number,
    language: String,
    explicitContent: Boolean,
    songCount: Number,
    isModule: Boolean, // 为 true 时，显示在首页 New Releases 列表
    moduleSortNo: {
      type: Number,
      default: 0,
    }, // 用于排序
    isTrending: Boolean, // 为 true 时，显示在首页 Trending 列表，显示在歌曲后
    trendingSortNo: {
      type: Number,
      default: 0,
    }, // 用于排序
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
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "song",
      },
    ],
  },
  { timestamps: true }
);

albumSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

albumSchema.set('toJSON', { virtuals: true });

export default mongoose.models.album ||
  mongoose.model("album", albumSchema, "album");
