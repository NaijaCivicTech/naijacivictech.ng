import mongoose, { Schema } from "mongoose";

const nigeriaGeopoliticalZoneSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  {
    collection: "nigeria_geopolitical_zones",
    strict: true,
    versionKey: false,
  },
);

nigeriaGeopoliticalZoneSchema.index({ sortOrder: 1 });

export const NigeriaGeopoliticalZoneModel =
  mongoose.models.NigeriaGeopoliticalZone ??
  mongoose.model(
    "NigeriaGeopoliticalZone",
    nigeriaGeopoliticalZoneSchema,
  );
