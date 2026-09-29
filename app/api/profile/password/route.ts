import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { ChangePasswordInputSchema } from "@/app/schemas/auth";
import { compare, hash } from "bcrypt-ts";

// password changes live on their own endpoint so a profile save can never
// silently rewrite the password (and so the current password can be required)
export async function PATCH(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        verifyToken(token);
    } catch {
        return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = ChangePasswordInputSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Invalid data", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const { currentPassword, newPassword } = parsed.data;

    if (currentPassword === newPassword) {
        return Response.json(
            { error: "Invalid data", issues: [{ path: ["newPassword"], message: "New password must be different from the current one" }] },
            { status: 400 }
        );
    }

    try {
        const decoded = verifyToken(token);
        await connectDB();
        const user = await User.findById(decoded.userId);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const valid = await compare(currentPassword, user.password);
        if (!valid) {
            return Response.json(
                { error: "Invalid data", issues: [{ path: ["currentPassword"], message: "Current password is incorrect" }] },
                { status: 400 }
            );
        }

        user.password = await hash(newPassword, 10);
        await user.save();

        return Response.json({ message: "Password updated" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "something went wrong while changing password" }, { status: 500 });
    }
}
