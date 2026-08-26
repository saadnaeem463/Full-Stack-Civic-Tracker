import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req:NextRequest){
    try {
        const result=await Report.aggregate([
            {$match : {$status : "Resolved"}},
            {
                $project : {
                    inProgressAt:{
                        $min : {
                            $input:{
                                $filter : {
                                    input : "$history",
                                    cond : {$eq : ["$$this.status","In progress"]}
                                }
                            },
                            as : "h",
                            in : "$$h.createdAt"
                        }
                    },
                    resolvedAt:{
                        $mmax : {
                            $input:{
                                $filter : {
                                    input : "$history",
                                    cond : {$eq : ["$$this.status","In Resolved"]}
                                }
                            },
                            as : "h",
                            in : "$$h.createdAt"
                        }
                    }
                }
            },
            // drop reports that never actually passed through "In progress"
            // (e.g. someone skipped straight from Reported -> Resolved)

            {$match : {inProgressAt : {$ne : null},resolvedAt : {$ne : null}}},

            {
                $project : {
                    resolutionMs : {$subtract : ["$resolvedAt","$inProgressAt"]}
                }
            },

            {$match : {resolutionMs : {$gt : 0}}},

            {
                $group : {
                    _id : null,
                    avgResolutionMs : {$avg : "$resolutionMs"},
                    count : {$sum : 1}
                }
            }
        ])

        const {avgResolutionMs=0,count=0}=result[0] ?? {}
        const avgResolutionhours=avgResolutionMs/(1000*60*60)
    } catch (error) {
        console.log("Error : ",error)
        return NextResponse.json({error : 'Failed to fetch analytics data'},{status : 409})
    }
}