export type ListingStatus = "Idea" | "Prototype" | "Live";

export type PipelineStage =
  | "suggested"
  | "accepted"
  | "building"
  | "live";

export type TeamRole =
  | "Frontend"
  | "Backend"
  | "Design"
  | "PM"
  | "Domain"
  | "Other";

export type ProjectTeamSlot = {
  userId: string;
  role: TeamRole;
};

export type TeamMember = ProjectTeamSlot & {
  name: string;
  image: string | null;
  color: string;
};

export type CivicProject = {
  id: string;
  slug: string;
  icon: string;
  name: string;
  description: string;
  category: string;
  votes: number;
  viewerHasVoted?: boolean;
  authorName: string;
  authorColor: string;
  /** Profile photo when submitter is a linked user (or stored snapshot). */
  authorImage?: string | null;
  user?: string | null;
  teams: TeamMember[];
  verified?: boolean;
  github: string | null;
  liveUrl: string | null;
  listingStatus?: ListingStatus;
  listingApprovedAt?: string | null;
  pipelineStage?: PipelineStage;
  criteria?: string[];
  postedAt: string;
  request?: string | null;
  /** Populated on list endpoints; total public comments on this project. */
  commentCount?: number;
};

/** Flat discussion comment on a project (public read; post requires sign-in). */
export type ProjectComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorColor: string;
  authorImage?: string | null;
  userId: string;
};

/** Who can see a given user profile facet (see User `profileVisibility`). */
export const PROFILE_FIELD_VISIBILITY = [
  "public",
  "members",
  "private",
] as const;
export type ProfileFieldVisibility =
  (typeof PROFILE_FIELD_VISIBILITY)[number];

export type {
  CreateIdeaBody,
  CreateIdeaPayload,
  CreateListingBody,
  CreateListingPayload,
  CreateProjectAuthContext,
  CreateProjectPostBody,
} from "./create-project";
