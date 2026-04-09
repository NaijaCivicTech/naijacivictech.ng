import mongoose, { Schema } from "mongoose";

const INSTITUTION_TYPES = [
  "university",
  "polytechnic",
  "college_of_education",
  "secondary",
  "other",
] as const;

const academicInstitutionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    institutionType: {
      type: String,
      enum: INSTITUTION_TYPES,
      required: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: "NigeriaState",
      default: null,
      index: true,
    },
    website: { type: String, default: null, trim: true },
    active: { type: Boolean, default: true },
  },
  {
    collection: "academic_institutions",
    strict: true,
    versionKey: false,
  },
);

academicInstitutionSchema.index({ active: 1, name: 1 });

export type AcademicInstitutionType = (typeof INSTITUTION_TYPES)[number];

export const AcademicInstitutionModel =
  mongoose.models.AcademicInstitution ??
  mongoose.model("AcademicInstitution", academicInstitutionSchema);
