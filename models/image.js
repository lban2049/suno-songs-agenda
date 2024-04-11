import mongoose from "mongoose";
const imageSchema = new mongoose.Schema({
  quality: String,
  url: String,
});

imageSchema.virtual('link').get(function() {
  return this.url;
});
imageSchema.set('toJSON', { virtuals: true });
imageSchema.set('toObject', { virtuals: true });

export default imageSchema;