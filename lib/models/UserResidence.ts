import mongoose, { Schema } from "mongoose";

/**
 * Residence history per user. At most one row per user has `isCurrent: true`
 * (partial unique index). When setting a new current residence, unset the prior
 * `isCurrent` in app code or use a transaction alongside inserting this row.
 */
const userResidenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaState",
      required: true,
    },
    lga: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaLga",
      required: true,
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaWard",
      default: null,
    },
    isCurrent: { type: Boolean, default: false, index: true },
  },
  {
    collection: "user_residences",
    strict: true,
    timestamps: true,
    versionKey: false,
  },
);

userResidenceSchema.index({ userId: 1, createdAt: -1 });
userResidenceSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { isCurrent: true },
  },
);

export const UserResidenceModel =
  mongoose.models.UserResidence ??
  mongoose.model("UserResidence", userResidenceSchema);
