import mongoose, { Schema } from "mongoose";

const nigeriaLgaSchema = new Schema(
  {
    state: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaState",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  {
    collection: "nigeria_lgas",
    strict: true,
    versionKey: false,
  },
);

nigeriaLgaSchema.index({ state: 1, slug: 1 }, { unique: true });
nigeriaLgaSchema.index({ name: 1 });

export const NigeriaLgaModel =
  mongoose.models.NigeriaLga ?? mongoose.model("NigeriaLga", nigeriaLgaSchema);
