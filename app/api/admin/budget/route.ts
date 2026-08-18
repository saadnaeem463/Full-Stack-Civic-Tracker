import { Expense } from "@/models/expense";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        const expenses=await Expense.find();
        if(!expenses){
            return NextResponse.json({error : "Error while fetching expenses"},{status : 400})
        }

        return NextResponse.json({expenses})
    } catch (error) {
        return NextResponse.json({error : "Error while fetching expenses"},{status : 400})
    }
}

export async function POST(req:NextRequest){
    try {
        const payload=await req.json()
        console.log(payload)
        return NextResponse.json({payload},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "Error while fetching expenses"},{status : 400})
    }
}