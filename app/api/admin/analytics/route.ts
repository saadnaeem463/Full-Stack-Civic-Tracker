import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const result = await Report.aggregate([
            { $match: { status: "Resolved" } },
            {
                $project: {
                    inProgressAt: {
                        $min: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$history",
                                        cond: { $eq: ["$$this.status", "In progress"] }
                                    }
                                },
                                as: "h",
                                in: "$$h.createdAt"
                            }
                        }
                    },
                    resolvedAt: {
                        $max: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$history",
                                        cond: { $eq: ["$$this.status", "Resolved"] }
                                    }
                                },
                                as: "h",
                                in: "$$h.createdAt"
                            }
                        }
                    }
                }
            },
            // drop reports that never actually passed through "In progress"
            // (e.g. someone skipped straight from Reported -> Resolved)
            { $match: { inProgressAt: { $ne: null }, resolvedAt: { $ne: null } } },

            {
                $project: {
                    resolutionMs: { $subtract: ["$resolvedAt", "$inProgressAt"] }
                }
            },

            // guard against bad data (resolved timestamp somehow before in-progress)
            { $match: { resolutionMs: { $gt: 0 } } },

            {
                $group: {
                    _id: null,
                    avgResolutionMs: { $avg: "$resolutionMs" },
                    count: { $sum: 1 }
                }
            }
        ])

        const { avgResolutionMs = 0, count = 0 } = result[0] ?? {}
        const avgResolutionHours = avgResolutionMs / (1000 * 60 * 60)

        const topUnresolved = await Report.aggregate([
            { $match: { status: { $ne: "Resolved" } } },
            { $addFields: { upvoteCount: { $size: "$upVotedBy" } } },
            { $sort: { upvoteCount: -1 } },
            { $limit: 5 },
            { $project: { title: 1, neighborhood: 1, status: 1, upvoteCount: 1 } }
        ])

        const reportsByNeighborhood = await Report.aggregate([
            { $match: { neighborhood: { $ne: null } } },
            { $group: { _id: "$neighborhood", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ])

        return NextResponse.json({
            avgResolutionHours,
            resolvedCount: count,
            topUnresolved,
            reportsByNeighborhood
        })
    } catch (error) {
        console.error("Analytics fetch failed:", error)
        return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }
}