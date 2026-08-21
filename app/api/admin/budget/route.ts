import { Expense } from "@/models/expense";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

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
        const {reportId,label}=payload
        const category=payload.category.charAt(0).toUpperCase() + payload.category.slice(1)
        const amount=Number(payload.amount)
        console.log(reportId,label,category,amount)
        await connectDB()
        const expense=await Expense.create({
            reportId,
            label,
            amount,
            category
        })

        return NextResponse.json({expense},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "Error :to create expense"},{status : 400})
    }
}