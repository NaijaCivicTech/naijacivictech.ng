import mongoose, { Schema } from "mongoose";

/**
 * Approved (or draft) career / office spells for a politician.
 * `politicianId` matches PolitiLog stable ids (e.g. plt-president) until a User/Politician collection exists.
 */
const jurisdictionSchema = new Schema(
  {
    tier: {
      type: String,
      required: true,
      enum: ["national", "state", "lga", "ward"],
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaState",
      default: null,
    },
    lga: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaLga",
      default: null,
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaWard",
      default: null,
    },
    label: { type: String, default: null, trim: true },
  },
  { _id: false, strict: true },
);

const politicianTimelineSegmentSchema = new Schema(
  {
    politicianId: { type: String, required: true, trim: true, index: true },
    office: {
      type: Schema.Types.ObjectId,
      ref: "PoliticalOffice",
      required: true,
      index: true,
    },
    officeSlug: { type: String, required: true, trim: true, index: true },
    startYear: { type: Number, required: true, index: true },
    endYear: { type: Number, default: null },
    title: { type: String, required: true, trim: true },
    organization: { type: String, default: null, trim: true },
    jurisdiction: { type: jurisdictionSchema, default: null },
    status: {
      type: String,
      required: true,
      enum: ["draft", "approved"],
      default: "draft",
      index: true,
    },
  },
  {
    collection: "politician_timeline_segments",
    strict: true,
    timestamps: true,
    versionKey: false,
  },
);

politicianTimelineSegmentSchema.index({
  officeSlug: 1,
  status: 1,
  startYear: 1,
});

export const PoliticianTimelineSegmentModel =
  mongoose.models.PoliticianTimelineSegment ??
  mongoose.model(
    "PoliticianTimelineSegment",
    politicianTimelineSegmentSchema,
  );
