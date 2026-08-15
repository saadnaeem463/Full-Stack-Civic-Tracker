import { connectDB } from "@/lib/db";
import { Workers } from "@/models/workers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        await connectDB()
        const workers=await Workers.find({active : true}).sort({fullname : 1})
        return NextResponse.json({workers})
    } catch (err) {
        console.error("Fetch workers failed:", err)
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
    }
}

export async function POST(req:NextRequest){
    try {
        const payload=await req.json()
        console.log(payload)
        await connectDB()
       const worker= await Workers.create({
            fullname : payload.fullname,
            email:payload.email,
            specialty : payload.specialty
        })
        return NextResponse.json({message : "Worker sucessfull created",worker})
    } catch (error) {
        console.error("creating workers failed:", error)
    return NextResponse.json({ error: "Failed to create workers" }, { status: 500 })
    }
}

export async function DELETE(req:NextRequest){
    try {
        const {searchParams}=req.nextUrl
        const workerId=searchParams.get("workerId")

        if(!workerId) return NextResponse.json({error : "No WorkerID Provided"},{status : 404})
        await connectDB()
        const workers=await Workers.findByIdAndDelete(workerId)
        return NextResponse.json({message : "Worker sucessfull removed",workers})
    } catch (error) {
        console.error("creating workers failed:", error)
    return NextResponse.json({ error: "Failed remove worker" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const workerId = searchParams.get("workerId")
    if (!workerId) return NextResponse.json({ error: "No WorkerID Provided" }, { status: 400 })

    const payload = await req.json()
    await connectDB()

    const worker = await Workers.findByIdAndUpdate(
      workerId,
      {
        fullname: payload.fullname,
        email: payload.email,
        specialty: payload.specialty,
      },
      { new: true }
    )

    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 })

    return NextResponse.json({ message: "Worker successfully updated", worker })
  } catch (error) {
    console.error("updating worker failed:", error)
    return NextResponse.json({ error: "Failed to update worker" }, { status: 500 })
  }
}