import { Report } from "@/models/report";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
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
                    cond: { $eq: ["$$this.status", "In progress"] },
                  },
                },
                as: "h",
                in: "$$h.createdAt",
              },
            },
          },
          resolvedAt: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: "$history",
                    cond: { $eq: ["$$this.status", "Resolved"] },
                  },
                },
                as: "h",
                in: "$$h.createdAt",
              },
            },
          },
        },
      },
      // drop reports that never actually passed through "In progress"
      // (e.g. someone skipped straight from Reported -> Resolved)
      { $match: { inProgressAt: { $ne: null }, resolvedAt: { $ne: null } } },

      {
        $project: {
          resolutionMs: { $subtract: ["$resolvedAt", "$inProgressAt"] },
          month: { $dateToString: { format: "%Y-%m", date: "$resolvedAt" } },
        },
      },

      // guard against bad data (resolved timestamp somehow before in-progress)
      { $match: { resolutionMs: { $gt: 0 } } },
      { $match: { month: { $gte: sixMonthsAgo.toISOString().slice(0, 7) } } }, // last 6 months only

      {
        $group: {
          _id: "$month", // ← group per month, not null
          avgResolutionMs: { $avg: "$resolutionMs" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // chronological order for the chart
    ]);

    const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const resolutionTrend = result.map((t) => {
        const [, monthNum] = t._id.split("-");
        return {
            month: monthLabels[parseInt(monthNum, 10) - 1],
            avgHours: Math.round(t.avgResolutionMs / (1000 * 60 * 60)),
            count: t.count
        };
    });

    const { avgResolutionMs = 0, count = 0 } = result[0] ?? {};
    const avgResolutionHours = avgResolutionMs / (1000 * 60 * 60);

    const topUnresolved = await Report.aggregate([
      { $match: { status: { $ne: "Resolved" } } },
      { $addFields: { upvoteCount: { $size: "$upVotedBy" } } },
      { $sort: { upvoteCount: -1 } },
      { $limit: 5 },
      { $project: { title: 1, neighborhood: 1, status: 1, upvoteCount: 1 } },
    ]);

    const reportsByNeighborhood = await Report.aggregate([
      { $match: { neighborhood: { $ne: null } } },
      { $group: { _id: "$neighborhood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
        resolutionTrend,
      avgResolutionHours,
      resolvedCount: count,
      topUnresolved,
      reportsByNeighborhood,
    });
  } catch (error) {
    console.error("Analytics fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
