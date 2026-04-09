import mongoose, { Schema } from "mongoose";

const politicalOfficeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    defaultHeadline: { type: String, required: true, trim: true },
    tier: {
      type: String,
      required: true,
      enum: ["federal", "state", "lga"],
      index: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ["executive", "legislature", "judiciary", "administration"],
      index: true,
    },
    body: {
      type: String,
      default: null,
      trim: true,
    },
    seatType: {
      type: String,
      required: true,
      enum: [
        "head_of_executive",
        "deputy_head_of_executive",
        "presiding_officer",
        "elected_member",
        "appointed_executive",
        "local_executive",
        "local_legislature",
      ],
    },
    jurisdictionScope: {
      type: String,
      required: true,
      enum: ["national", "state", "lga", "ward"],
      index: true,
    },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  {
    collection: "political_offices",
    strict: true,
    versionKey: false,
  },
);

politicalOfficeSchema.index({ tier: 1, branch: 1, sortOrder: 1 });

export const PoliticalOfficeModel =
  mongoose.models.PoliticalOffice ??
  mongoose.model("PoliticalOffice", politicalOfficeSchema);
