import mongoose, { Schema } from "mongoose";

const religionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    collection: "religions",
    strict: true,
    versionKey: false,
  },
);

religionSchema.index({ active: 1, sortOrder: 1 });

export const ReligionModel =
  mongoose.models.Religion ?? mongoose.model("Religion", religionSchema);
