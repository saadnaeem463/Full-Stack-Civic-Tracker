import { Budget, SINGLETON_ID } from "@/models/budget";
import { CategoryBudget } from "@/models/category-budget";
import { Report} from "@/models/report";
import { Workers } from "@/models/workers";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req:NextRequest){
    try {
        const totalSpend=await CategoryBudget.aggregate([{$group : {_id : null, spend : {$sum : "$spend"},totalAllocated : {$sum : '$allocated'}}}])
        const recentReports=await Report.find().sort({'createdAt':-1}).limit(7)
        const [reports]=await Report.aggregate([
            {
                $facet:{
                    reportsGen:[
                        {$group : {_id : "$status" , count : {$sum : 1},flagged : {$sum : {$cond : ["$suspicious",1,0]}}}}
                    ],
                    reportsByCat :[
                        {$group : {_id : "$issueType", count : {$sum : 1}}}
                    ]
                }
            }
        ])

        const [workers]=await Workers.aggregate([
            {
                $facet :{
                    groupByStatus :[
                        {$group : {_id : "$status", count : {$sum :1}}}
                    ],
                    busyWorkers :[
                        { $match: { status: "Busy", currentReport: { $ne: null } } },
                        {$group : {_id: ["$fullname","$currentReport"]}}
                    ]
                }
            }
        ])
        const total = reports.reportsGen.reduce((sum, r) => sum + r.count, 0)
        const suspicious = reports.reportsGen.reduce((sum, r) => sum + r.flagged, 0)
        return NextResponse.json({reports,total,suspicious,workers,totalSpend,recentReports})
    } catch (error) {
        return NextResponse.json({error :"Failed to fetch dashboard data"},{status : 409})
    }
}