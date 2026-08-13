export type ReportStatus = "Reported" | "Acknowledged" | "In progress" | "Resolved";
export type ReportCategory = "Roads" | "Lighting" | "Cleanliness" | "Parks";

export type Report = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  address: string;
  neighborhood: string;
  reporter: string;
  upvotes: number;
  date: string;
  createdLabel: string;
  assignedTo: string | null;
  suspicious: boolean;
  slaHoursLeft: number;
  cost: number | null;
  media: { url: string; alt: string }[];
  comments: { author: string; text: string; time: string }[];
  internalNotes: { author: string; text: string; time: string }[];
  history: { status: ReportStatus; by: string; time: string }[];
};

export type Worker = {
  id: string;
  name: string;
  initials: string;
  specialty: "Roads crew" | "Electrical" | "Sanitation" | "Parks";
  status: "Busy" | "Free";
  currentReport: string | null;
  completedJobs: number;
  avgResolutionHours: number;
  contact: string;
};

const potholePhoto = "https://cdn.magicpatterns.com/patterns/generated-images/c1e8b1fb-5c8b-4702-8dca-871d71d5126d.jpg";

export const workers: Worker[] = [
  { id: "W-01", name: "Dana Whitfield", initials: "DW", specialty: "Roads crew", status: "Busy", currentReport: "CT-1048", completedJobs: 84, avgResolutionHours: 31, contact: "d.whitfield@city.gov" },
  { id: "W-02", name: "Luis Marchetti", initials: "LM", specialty: "Electrical", status: "Busy", currentReport: "CT-1047", completedJobs: 62, avgResolutionHours: 22, contact: "l.marchetti@city.gov" },
  { id: "W-03", name: "Priya Raman", initials: "PR", specialty: "Sanitation", status: "Free", currentReport: null, completedJobs: 118, avgResolutionHours: 12, contact: "p.raman@city.gov" },
  { id: "W-04", name: "Owen Baptiste", initials: "OB", specialty: "Parks", status: "Free", currentReport: null, completedJobs: 47, avgResolutionHours: 40, contact: "o.baptiste@city.gov" },
  { id: "W-05", name: "Nadia Coles", initials: "NC", specialty: "Roads crew", status: "Busy", currentReport: "CT-1035", completedJobs: 73, avgResolutionHours: 28, contact: "n.coles@city.gov" },
  { id: "W-06", name: "Samuel Ortiz", initials: "SO", specialty: "Electrical", status: "Free", currentReport: null, completedJobs: 55, avgResolutionHours: 19, contact: "s.ortiz@city.gov" },
];

export const reports: Report[] = [
  {
    id: "CT-1048",
    title: "Large pothole at crosswalk",
    description: "Deep pothole in the eastbound lane beside the crosswalk. Hard to see after rain and vehicles are swerving into the bike lane to avoid it.",
    category: "Roads",
    status: "In progress",
    address: "Market St & 5th St",
    neighborhood: "Civic Center",
    reporter: "Maya Reyes",
    upvotes: 38,
    date: "2026-08-09",
    createdLabel: "Aug 9, 2026",
    assignedTo: "W-01",
    suspicious: false,
    slaHoursLeft: 9,
    cost: 1840,
    media: [{ url: potholePhoto, alt: "Pothole beside a marked crosswalk with a traffic cone" }],
    comments: [
      { author: "Maya Reyes", text: "It has grown noticeably wider since the storm last week.", time: "Aug 9, 9:12 AM" },
      { author: "Tom Alvarez", text: "Second this — my bike tire went straight into it yesterday.", time: "Aug 9, 4:40 PM" },
    ],
    internalNotes: [{ author: "K. Osei", text: "Asphalt patch scheduled with the Tuesday roads run. Materials already on the truck.", time: "Aug 10, 8:02 AM" }],
    history: [
      { status: "Reported", by: "Maya Reyes", time: "Aug 9, 9:10 AM" },
      { status: "Acknowledged", by: "K. Osei", time: "Aug 9, 2:15 PM" },
      { status: "In progress", by: "D. Whitfield", time: "Aug 10, 8:30 AM" },
    ],
  },
  {
    id: "CT-1047",
    title: "Streetlight out near playground",
    description: "The lamp beside the south playground entrance has been dark for several nights, making the path unsafe after sunset.",
    category: "Lighting",
    status: "Acknowledged",
    address: "Oak Ave, by Linden Park",
    neighborhood: "Westside",
    reporter: "Jordan Tate",
    upvotes: 17,
    date: "2026-08-10",
    createdLabel: "Aug 10, 2026",
    assignedTo: "W-02",
    suspicious: false,
    slaHoursLeft: 26,
    cost: null,
    media: [],
    comments: [{ author: "Jordan Tate", text: "Two other lamps on the same stretch flicker as well.", time: "Aug 10, 7:55 PM" }],
    internalNotes: [{ author: "R. Feld", text: "Possible shared circuit fault — electrical to inspect the full run, not just the single lamp.", time: "Aug 11, 7:20 AM" }],
    history: [
      { status: "Reported", by: "Jordan Tate", time: "Aug 10, 7:50 PM" },
      { status: "Acknowledged", by: "R. Feld", time: "Aug 11, 7:15 AM" },
    ],
  },
  {
    id: "CT-1045",
    title: "Overflowing bin needs collection",
    description: "Public bin has overflowed onto the sidewalk and is attracting birds and rodents outside the market entrance.",
    category: "Cleanliness",
    status: "Reported",
    address: "214 Harbor Boulevard",
    neighborhood: "Waterfront",
    reporter: "Alex Pham",
    upvotes: 12,
    date: "2026-08-08",
    createdLabel: "Aug 8, 2026",
    assignedTo: null,
    suspicious: false,
    slaHoursLeft: 4,
    cost: null,
    media: [],
    comments: [],
    internalNotes: [],
    history: [{ status: "Reported", by: "Alex Pham", time: "Aug 8, 11:04 AM" }],
  },
  {
    id: "CT-1039",
    title: "Damaged bench by bus stop",
    description: "Wooden seat slats are split and unsafe for older residents waiting for the crosstown bus.",
    category: "Parks",
    status: "Resolved",
    address: "Jefferson & 12th",
    neighborhood: "Downtown",
    reporter: "Noah Lindqvist",
    upvotes: 9,
    date: "2026-08-02",
    createdLabel: "Aug 2, 2026",
    assignedTo: "W-04",
    suspicious: false,
    slaHoursLeft: 0,
    cost: 420,
    media: [],
    comments: [{ author: "Noah Lindqvist", text: "Thanks for the quick turnaround — the new slats look great.", time: "Aug 6, 5:31 PM" }],
    internalNotes: [{ author: "O. Baptiste", text: "Replaced four slats and re-sealed the frame. Materials pulled from parks stock.", time: "Aug 6, 3:10 PM" }],
    history: [
      { status: "Reported", by: "Noah Lindqvist", time: "Aug 2, 8:22 AM" },
      { status: "Acknowledged", by: "K. Osei", time: "Aug 3, 9:00 AM" },
      { status: "In progress", by: "O. Baptiste", time: "Aug 5, 10:15 AM" },
      { status: "Resolved", by: "O. Baptiste", time: "Aug 6, 3:05 PM" },
    ],
  },
  {
    id: "CT-1035",
    title: "Blocked curb ramp",
    description: "Roadwork materials have blocked the only curb ramp at this intersection, forcing wheelchair users into the traffic lane.",
    category: "Roads",
    status: "In progress",
    address: "Pine St & 3rd St",
    neighborhood: "North Quarter",
    reporter: "Tara Simmons",
    upvotes: 24,
    date: "2026-08-05",
    createdLabel: "Aug 5, 2026",
    assignedTo: "W-05",
    suspicious: false,
    slaHoursLeft: 2,
    cost: 260,
    media: [],
    comments: [{ author: "Tara Simmons", text: "This has been blocked for over a week now.", time: "Aug 7, 12:02 PM" }],
    internalNotes: [{ author: "K. Osei", text: "Accessibility priority — escalate if the contractor has not cleared the ramp by end of day.", time: "Aug 10, 4:45 PM" }],
    history: [
      { status: "Reported", by: "Tara Simmons", time: "Aug 5, 8:40 AM" },
      { status: "Acknowledged", by: "K. Osei", time: "Aug 6, 9:30 AM" },
      { status: "In progress", by: "N. Coles", time: "Aug 10, 1:20 PM" },
    ],
  },
  {
    id: "CT-1031",
    title: "Graffiti across underpass wall",
    description: "Large tags covering the pedestrian underpass. Reported repeatedly by the same account with no photo evidence.",
    category: "Cleanliness",
    status: "Reported",
    address: "Canal Rd underpass",
    neighborhood: "Southbank",
    reporter: "anon_4471",
    upvotes: 2,
    date: "2026-08-07",
    createdLabel: "Aug 7, 2026",
    assignedTo: null,
    suspicious: true,
    slaHoursLeft: 18,
    cost: null,
    media: [],
    comments: [],
    internalNotes: [{ author: "R. Feld", text: "Fifth near-identical submission from this account today. Holding for review.", time: "Aug 7, 6:12 PM" }],
    history: [{ status: "Reported", by: "anon_4471", time: "Aug 7, 6:02 PM" }],
  },
  {
    id: "CT-1028",
    title: "Fallen branch blocking path",
    description: "Storm damage has left a heavy branch across the riverside walking path near the north gate.",
    category: "Parks",
    status: "Acknowledged",
    address: "Riverside Path, north gate",
    neighborhood: "Westside",
    reporter: "Grace Odum",
    upvotes: 15,
    date: "2026-08-06",
    createdLabel: "Aug 6, 2026",
    assignedTo: null,
    suspicious: false,
    slaHoursLeft: 12,
    cost: null,
    media: [],
    comments: [],
    internalNotes: [],
    history: [
      { status: "Reported", by: "Grace Odum", time: "Aug 6, 7:15 AM" },
      { status: "Acknowledged", by: "K. Osei", time: "Aug 6, 11:40 AM" },
    ],
  },
  {
    id: "CT-1022",
    title: "Flickering lamps along bridge walkway",
    description: "Six lamps along the pedestrian bridge cut out intermittently through the evening.",
    category: "Lighting",
    status: "Resolved",
    address: "Halsey Pedestrian Bridge",
    neighborhood: "Downtown",
    reporter: "Ibrahim Nasser",
    upvotes: 21,
    date: "2026-07-29",
    createdLabel: "Jul 29, 2026",
    assignedTo: "W-06",
    suspicious: false,
    slaHoursLeft: 0,
    cost: 1120,
    media: [],
    comments: [],
    internalNotes: [{ author: "S. Ortiz", text: "Replaced the failing driver unit; whole run tested stable over two nights.", time: "Aug 2, 9:05 AM" }],
    history: [
      { status: "Reported", by: "Ibrahim Nasser", time: "Jul 29, 9:44 PM" },
      { status: "Acknowledged", by: "R. Feld", time: "Jul 30, 8:10 AM" },
      { status: "In progress", by: "S. Ortiz", time: "Jul 31, 8:00 AM" },
      { status: "Resolved", by: "S. Ortiz", time: "Aug 2, 9:00 AM" },
    ],
  },
];

export const budgetCategories = [
  { category: "Roads", allocated: 320000, spent: 214500 },
  { category: "Lighting", allocated: 180000, spent: 96400 },
  { category: "Cleanliness", allocated: 140000, spent: 118200 },
  { category: "Parks", allocated: 110000, spent: 41800 },
];

export const expenses = [
  { id: "EX-318", reportId: "CT-1048", label: "Asphalt patch — Market & 5th", category: "Roads", amount: 1840, date: "Aug 10, 2026" },
  { id: "EX-317", reportId: "CT-1022", label: "Bridge lamp driver replacement", category: "Lighting", amount: 1120, date: "Aug 2, 2026" },
  { id: "EX-316", reportId: "CT-1039", label: "Bench slat replacement", category: "Parks", amount: 420, date: "Aug 6, 2026" },
  { id: "EX-315", reportId: "CT-1035", label: "Curb ramp clearance crew", category: "Roads", amount: 260, date: "Aug 10, 2026" },
];

export const auditLog = [
  { id: "A-902", actor: "K. Osei", role: "Admin", action: "Changed status of CT-1048 to In progress", time: "Aug 10, 8:30 AM" },
  { id: "A-901", actor: "R. Feld", role: "Moderator", action: "Added internal note on CT-1031", time: "Aug 7, 6:12 PM" },
  { id: "A-900", actor: "K. Osei", role: "Admin", action: "Assigned CT-1035 to Nadia Coles", time: "Aug 10, 1:20 PM" },
  { id: "A-899", actor: "S. Ortiz", role: "Moderator", action: "Marked CT-1022 as Resolved", time: "Aug 2, 9:00 AM" },
  { id: "A-898", actor: "K. Osei", role: "Admin", action: "Adjusted Lighting budget allocation", time: "Aug 1, 10:22 AM" },
];

export const notifications = [
  { id: "N-1", title: "SLA due in 2 hours", detail: "CT-1035 · Blocked curb ramp", urgent: true },
  { id: "N-2", title: "SLA due in 4 hours", detail: "CT-1045 · Overflowing bin", urgent: true },
  { id: "N-3", title: "New report submitted", detail: "CT-1047 · Streetlight out near playground", urgent: false },
  { id: "N-4", title: "Report flagged for review", detail: "CT-1031 · Graffiti across underpass wall", urgent: false },
];

export const resolutionTrend = [
  { month: "Mar", hours: 74 },
  { month: "Apr", hours: 68 },
  { month: "May", hours: 61 },
  { month: "Jun", hours: 52 },
  { month: "Jul", hours: 47 },
  { month: "Aug", hours: 38 },
];

export const neighborhoodVolume = [
  { name: "Civic Center", count: 62 },
  { name: "Westside", count: 48 },
  { name: "Downtown", count: 41 },
  { name: "Waterfront", count: 27 },
  { name: "North Quarter", count: 19 },
];

export const topReporters = [
  { name: "Maya Reyes", reports: 24, resolved: 19 },
  { name: "Tara Simmons", reports: 18, resolved: 12 },
  { name: "Grace Odum", reports: 15, resolved: 11 },
];
