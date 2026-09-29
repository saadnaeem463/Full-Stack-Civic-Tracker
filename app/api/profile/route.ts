import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { isValidObjectId } from "mongoose";
import { UpdateProfileSchema } from "@/app/schemas/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

async function getAuthedUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return { error: "Not authenticated" };

    try {
        const decoded = verifyToken(token);
        if (!isValidObjectId(decoded.userId)) return { error: "Invalid token" };
        return { userId: decoded.userId };
    } catch {
        return { error: "Invalid token" };
    }
}

function publicUser(user: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}) {
    return {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar ?? "",
        isVerified: user.isVerified ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export async function GET() {
    const auth = await getAuthedUserId();
    if (auth.error) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    try {
        await connectDB();
        const user = await User.findById(auth.userId).select("-password");
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }
        return Response.json({ user: publicUser(user) });
    } catch (error) {
        console.error("GET /api/profile failed:", error);
        return Response.json({ error: "something went wrong while fetching profile" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const auth = await getAuthedUserId();
    if (auth.error) {
        return Response.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = UpdateProfileSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Invalid data", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    try {
        await connectDB();
        const user = await User.findById(auth.userId);
        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const nextEmail = parsed.data.email.trim().toLowerCase();
        const emailChanged = nextEmail !== user.email.toLowerCase();

        if (emailChanged) {
            const existing = await User.findOne({ email: nextEmail });
            if (existing) {
                return Response.json({ error: "Email Already Exists" }, { status: 409 });
            }
        }

        user.name = parsed.data.name;
        user.email = nextEmail;
        user.avatar = parsed.data.avatar || "";

        if (emailChanged) {
            // the new address has to be proven before it can be trusted anywhere
            user.isVerified = false;
            user.verificationToken = generateVerificationToken();
            user.verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
        }

        await user.save();

        if (emailChanged) {
            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${user.verificationToken}`;
            await sendVerificationEmail({ email: nextEmail, name: user.name, verifyUrl });
        }

        return Response.json({
            message: emailChanged ? "Profile updated, check your inbox to verify your new email" : "Profile updated",
            user: publicUser(user),
            requiresEmailVerification: emailChanged,
        });
    } catch (error) {
        console.error(error);
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
            return Response.json({ error: "Email Already Exists" }, { status: 409 });
        }
        return Response.json({ error: "something went wrong while updating profile" }, { status: 500 });
    }
}
