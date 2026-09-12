import { connectDB } from "@/lib/db";
import { BudgetRequest } from "@/models/budget-request";
import { NextRequest,NextResponse } from "next/server";
import { getAdmin } from "@/lib/get-admin";
import { AuditLog } from "@/models/audit-log";
import { User } from "@/models/user";
import { pusherServer } from "@/lib/pusher";
import { BUDGET_CHANNEL,NEW_BUDGET_REQUEST_EVENT,BUDGET_REQUEST_RESOLVED_EVENT } from "@/lib/pusher-events";
export async function GET(req:NextRequest){
    try{
        await connectDB()
        const {searchParams}=req.nextUrl
        const category=searchParams.get('category')
        const status=searchParams.get('status')

        const query: Record<string,string>={}
        if(category) query.category=category
        if(status) query.status=status

        const requests = await BudgetRequest.find(query).sort({ createdAt: -1 });
        return NextResponse.json({requests},{status : 202})
    }catch(error){
        console.error("Fetch budget requests failed:", error);
        return NextResponse.json({ error: "Failed to fetch budget requests" }, { status: 500 });
    }
}

export async function POST(req:NextRequest){
    try{
        const admin=await getAdmin()
        const {category,note}=await req.json()
        if(!category){
            return NextResponse.json({error : "Category is required"},{status : 400})
        }

        const request=await BudgetRequest.create({
            category,
            requesterNote: note,
            requestedBy : admin.userId
        })

        const actor=await User.findById(admin.userId)
        await AuditLog.create({
            actorId : admin.userId,
            actorRole:admin.role,
            actorName : actor?.name ?? "Unknown",
            action : "budget_requested",
            message : `${actor?.name ?? "A staff member"} requested a budget increase for ${category}`
        })

        pusherServer
        .trigger(BUDGET_CHANNEL,NEW_BUDGET_REQUEST_EVENT,{requestId : request._id,category})
        .catch((err) => console.log("Pusher trigger failed:", err));
        return NextResponse.json({ message: "Budget request submitted", request }, { status: 202 });
    }catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: `A budget request for ${req.nextUrl.searchParams.get("category") ?? "this category"} is already pending` },
                { status: 409 }
            );
        }
        console.error("Create budget request failed:", error);
        return NextResponse.json({ error: "Failed to submit budget request" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const admin = await getAdmin();
        const { searchParams } = req.nextUrl;
        const requestId = searchParams.get("requestId");
        if (!requestId) {
            return NextResponse.json({ error: "requestId is required" }, { status: 400 });
        }

        const { status, adminNote } = await req.json();
        if (!status || !["Approved", "Rejected"].includes(status)) {
            return NextResponse.json({ error: "status must be Approved or Rejected" }, { status: 400 });
        }
        if (!adminNote || !adminNote.trim()) {
            return NextResponse.json({ error: "adminNote is required" }, { status: 400 });
        }

        await connectDB();
        const budgetRequest = await BudgetRequest.findById(requestId);
        if (!budgetRequest) {
            return NextResponse.json({ error: "Budget request not found" }, { status: 404 });
        }
        if (budgetRequest.status !== "Pending") {
            return NextResponse.json({ error: "This request has already been reviewed" }, { status: 409 });
        }

        budgetRequest.status = status;
        budgetRequest.adminNote = adminNote;
        budgetRequest.reviewedBy = admin.userId;
        budgetRequest.reviewedAt = new Date();
        await budgetRequest.save();

        const actor=await User.findById(admin.userId)
        await AuditLog.create({
            actorId : admin.userId,
            actorRole:admin.role,
            actorName :status === "Approved" ? "budget_allocated" : "budget_rejected",
            action : "budget_requested",
            message: `${actor?.name ?? "An admin"} ${status.toLowerCase()} the budget request for ${budgetRequest.category}`}
        )

        pusherServer
        .trigger(BUDGET_CHANNEL,NEW_BUDGET_REQUEST_EVENT,{requestId,category : budgetRequest.category,status})
        .catch((err) => console.log("Pusher trigger failed:", err));

        return NextResponse.json({ message: `Request ${status.toLowerCase()}`, request: budgetRequest });
    } catch (error) {
        console.error("Review budget request failed:", error);
        return NextResponse.json({ error: "Failed to review budget request" }, { status: 500 });
    }
}