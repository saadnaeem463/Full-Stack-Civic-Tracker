import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/get-admin";

export async function DELETE(req: NextRequest) {
    try {
        const admin = await getAdmin()
        const { searchParams } = req.nextUrl
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // Prevent admin from deleting themselves
        if (userId === admin.userId) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
        }

        await connectDB()
        const user = await User.findById(userId)

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Prevent deleting other admins
        if (user.role === "admin") {
            return NextResponse.json({ error: "Cannot delete other admins" }, { status: 403 })
        }

        await User.findByIdAndDelete(userId)

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Delete user failed:", error)
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}