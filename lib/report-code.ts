/**
 * Short, readable report codes ("TASK-0007") used in place of raw Mongo ids.
 *
 * Mongo ObjectIds start with a creation timestamp, so sorting ids ascending
 * gives creation order. The Nth oldest report is TASK-000N. The code is derived,
 * not stored, so if an older report is deleted the later ones shift down by one.
 */
export function buildReportCodes(ids: string[]): Map<string, string> {
  const sorted = [...new Set(ids)].sort()
  return new Map(sorted.map((id, index) => [id, `TASK-${String(index + 1).padStart(4, "0")}`]))
}
