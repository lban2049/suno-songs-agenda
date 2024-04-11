import mongoose from "mongoose";

const lyricsSchema = new mongoose.Schema(
  {
    lyrics: String,
    copyright: String,
    snippet: String,
  },
  { timestamps: true }
);

lyricsSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

lyricsSchema.set('toJSON', { virtuals: true });

export default mongoose.models.lyrics ||
  mongoose.model("lyrics", lyricsSchema, "lyrics");
