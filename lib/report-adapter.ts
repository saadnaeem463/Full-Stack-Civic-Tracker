import { Report as ReportUI,Worker as WorkerUI } from "@/data/adminData";

function formatLabel(date : string | Date){
    return new Date(date).toLocaleDateString("en-US",{month : "short",day : "numeric"})
}

export function adaptReport(dbReport : any) : ReportUI{
    return {
        id : dbReport._id,
        title : dbReport.title,
        description : dbReport.details ??"",
        category : dbReport.issueType,
        status  :dbReport.status,
        address: dbReport.location,
        neighborhood  :"",
        reporter : dbReport.userId?.name ?? "Unknown",
        upvotes : dbReport.upVotedBy?.length ?? 0,
        date : new Date(dbReport.createdAt).toISOString().slice(0,10),
        createdLabel : formatLabel(dbReport.createdAt),
        assignedTo : dbReport.assignedTo ?? null,
        suspicious :dbReport.suspicious,
        slaHoursLeft : 0,
        cost : null,
        media : (dbReport.media ?? []).map((item:any)=>({url : item.url,alt :item.type})),
        comments : (dbReport.comments ?? []).map((c:any)=>(
            {
            author : c.author,
            text : c.text,
            time : formatLabel(c.createdAt)
        }
        )),
        internalNotes : (dbReport.internalNotes?? []).map((n:any)=>({
            author : n.author,
            text : n.text,
            time : formatLabel(n.createdAt)
        })),
        history : (dbReport.history?? []).map((h:any)=>({
            status : h.status,
            by:h.by,
            time : formatLabel(h.createdAt)
        }))
    }
}

export function adaptWorker(dbWorker: any) : WorkerUI{
    return{
        id : dbWorker._id,
        name : dbWorker.fullname,
        initials: dbWorker.fullname
        .trim()
        .split(/\s+/)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
        specialty : dbWorker.specialty,
        status : dbWorker.status,
        currentReport : dbWorker.currentReport ?? null,
        completedJobs : dbWorker.jobsCompleted,
        avgResolutionHours :0,
        contact : dbWorker.email
    }
} 