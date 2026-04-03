import { normalizeEmail } from "@/lib/email";
import { UserModel } from "@/lib/models/User";
import { connectMongoose } from "@/lib/mongoose";
import { verifyPassword } from "@/lib/password";
import { claimProjectsForAuthorEmail } from "@/lib/services/server/claim-projects";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
const googleEnabled = Boolean(googleClientId && googleClientSecret);

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "dev-only-insecure-auth-secret-set-AUTH_SECRET-in-env"
    : undefined);

async function attachAdminToToken(token: { sub?: string; isAdmin?: boolean }) {
  if (!token.sub) {
    token.isAdmin = false;
    return;
  }
  await connectMongoose();
  const u = await UserModel.findById(token.sub).select("isAdmin").lean();
  token.isAdmin = Boolean(u && (u as { isAdmin?: boolean }).isAdmin);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Email & password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        await connectMongoose();
        const user = await UserModel.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user._id.toHexString(),
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile) {
        const raw = (profile as { email?: string | null }).email;
        if (!raw) return token;
        const email = normalizeEmail(raw);
        const profilePicture = (profile as { picture?: string | null }).picture;
        const userImage =
          user && typeof (user as { image?: string | null }).image === "string"
            ? (user as { image?: string | null }).image
            : null;
        const googleImage =
          typeof profilePicture === "string" && profilePicture.trim().length > 0
            ? profilePicture.trim()
            : userImage && userImage.trim().length > 0
              ? userImage.trim()
              : null;

        await connectMongoose();
        const $set: { name: string; image?: string | null } = {
          name: (profile as { name?: string | null }).name ?? token.name ?? "",
        };
        if (googleImage) {
          $set.image = googleImage;
        }

        const doc = await UserModel.findOneAndUpdate(
          { email },
          { $set },
          {
            upsert: true,
            new: true,
          },
        );
        const userId = doc._id.toHexString();
        token.sub = userId;
        token.email = email;
        token.name =
          doc.name || (profile as { name?: string | null }).name || token.name;
        const storedImage =
          typeof doc.image === "string" && doc.image.length > 0
            ? doc.image
            : (googleImage ?? undefined);
        if (storedImage) {
          token.picture = storedImage;
        }
        await claimProjectsForAuthorEmail(email, userId);
        await attachAdminToToken(token);
        return token;
      }

      if (account?.provider === "credentials" && user) {
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image;
        const uid = user.id;
        if (user.email && uid) {
          token.email = normalizeEmail(user.email);
          await claimProjectsForAuthorEmail(token.email, uid);
        }
        await attachAdminToToken(token);
        return token;
      }

      await attachAdminToToken(token);
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
        session.user.isAdmin = token.isAdmin === true;
      }
      return session;
    },
  },
});
