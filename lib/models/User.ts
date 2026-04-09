import { PROFILE_FIELD_VISIBILITY } from "@/data/types";
import mongoose, { Schema } from "mongoose";

const profileVisibilitySchema = new Schema(
  {
    residence: {
      type: String,
      enum: PROFILE_FIELD_VISIBILITY,
      default: "private",
    },
    politicalParty: {
      type: String,
      enum: PROFILE_FIELD_VISIBILITY,
      default: "private",
    },
    religion: {
      type: String,
      enum: PROFILE_FIELD_VISIBILITY,
      default: "private",
    },
    academicInstitution: {
      type: String,
      enum: PROFILE_FIELD_VISIBILITY,
      default: "private",
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, default: "" },
    image: { type: String, default: null },
    passwordHash: { type: String, default: null, select: false },
    isAdmin: { type: Boolean, default: false },
    profile: {
      politicalParty: {
        type: Schema.Types.ObjectId,
        ref: "PoliticalParty",
        default: null,
      },
      religion: {
        type: Schema.Types.ObjectId,
        ref: "Religion",
        default: null,
      },
      primaryAcademicInstitution: {
        type: Schema.Types.ObjectId,
        ref: "AcademicInstitution",
        default: null,
      },
    },
    profileVisibility: {
      type: profileVisibilitySchema,
      default: () => ({
        residence: "private",
        politicalParty: "private",
        religion: "private",
        academicInstitution: "private",
      }),
    },
  },
  {
    collection: "users",
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel =
  mongoose.models.User ?? mongoose.model("User", userSchema);
