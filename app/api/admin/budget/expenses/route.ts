import { Expense } from "@/models/expense";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryBudget } from "@/models/category-budget";
// import { CategoryBudget } from "@/models/category-budget";

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
        const budget=await CategoryBudget.find({category})
        console.log(budget)
        const catBud=budget.find((bud)=>bud.category===category)
        if(catBud.spend+amount>catBud.allocated){
            return NextResponse.json({error :`Expense exceeds the total budget for category ${category}`},{status : 409})
        }
        catBud.spend+=amount
        await catBud.save()
        const expense=await Expense.create({
            reportId,
            label,
            amount,
            category
        })

        return NextResponse.json({expense},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "Error to create expense"},{status : 500})
    }
}