import mongoose, { Schema } from "mongoose";

const nigeriaWardSchema = new Schema(
  {
    lga: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaLga",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  {
    collection: "nigeria_wards",
    strict: true,
    versionKey: false,
  },
);

nigeriaWardSchema.index({ lga: 1, slug: 1 }, { unique: true });
nigeriaWardSchema.index({ name: 1 });

export const NigeriaWardModel =
  mongoose.models.NigeriaWard ?? mongoose.model("NigeriaWard", nigeriaWardSchema);
