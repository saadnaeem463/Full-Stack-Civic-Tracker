import { Budget,SINGLETON_ID } from "@/models/budget";
import { CategoryBudget } from "@/models/category-budget";
import { Expense } from "@/models/expense";
import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = ["Roads", "Lightning", "Cleanliness", "Parks"]
export async function GET(req:NextRequest){
    try {
        // const expenses=await Expense.aggregate([{ $group : {_id : "$category", spent : {$sum : "$amount"}}}])
        const {searchParams}=req.nextUrl
        const cat=searchParams.get("category")

        if(cat){
            console.log("Categoryyyyyyyyyyyy : ",cat)
            const found=await CategoryBudget.findOne({category : cat})
            if(!found){
                return NextResponse.json({error : "Error finding the category budget"},{status : 404})
            }

            const remainingBudget=found.allocated-found.spend
            return NextResponse.json({remainingBudget},{status : 200})

        }
        console.log("Finnnnnnnnnnnnnnnd")
        const catBudget=await CategoryBudget.find()
        if(catBudget.length<4) return NextResponse.json({expenses:null},{status : 202})

        return NextResponse.json({expenses:catBudget},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "failed to find expenses by category"},{status : 404})
    }
}

export async function POST(req:NextRequest){
    try {
        const payload=await req.json()
        const {category,amount}=payload
        console.log(amount)
        const budgetCheck=await CategoryBudget.aggregate([{$group : {_id: null,totalSum : {$sum : "$allocated"}}}])
        const budget=await Budget.findById(SINGLETON_ID)
        if((amount+(budgetCheck[0]?.totalSum) )> budget.Amount){
            return NextResponse.json({error : "Allocation Exceeded"},{status : 409})
        }
        console.log("Cates budget  : ",(amount+budgetCheck[0]?.totalSum))
        const catBudget=await CategoryBudget.create({category,allocated : amount})
        return NextResponse.json({message : "Amount allocated for category"},{status : 202})
    } catch (error) {
        return NextResponse.json({error : "failed to allocate budget for category"},{status : 404})
    }
}