import mongoose, { Schema } from "mongoose";

const politicalPartySchema = new Schema(
  {
    acronym: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    collection: "political_parties",
    strict: true,
    versionKey: false,
  },
);

politicalPartySchema.index({ active: 1, sortOrder: 1 });

export const PoliticalPartyModel =
  mongoose.models.PoliticalParty ??
  mongoose.model("PoliticalParty", politicalPartySchema);
