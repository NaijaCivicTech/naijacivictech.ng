import mongoose, { Schema } from "mongoose";

const nigeriaStateSchema = new Schema(
  {
    zone: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaGeopoliticalZone",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    capital: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    aliases: { type: [String], default: [] },
  },
  {
    collection: "nigeria_states",
    strict: true,
    versionKey: false,
  },
);

nigeriaStateSchema.index({ name: 1 });

export const NigeriaStateModel =
  mongoose.models.NigeriaState ??
  mongoose.model("NigeriaState", nigeriaStateSchema);
