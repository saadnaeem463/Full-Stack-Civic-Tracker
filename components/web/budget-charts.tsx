"use client"

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"

interface CategoryRow { category: string; spend: number; allocated: number }
interface ExpenseRow { amount: number; createdAt?: string }

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]
const money = (n: number) => `$${Math.round(n).toLocaleString()}`
const compact = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`)
const tooltipStyle = {
  background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12,
  color: "var(--popover-foreground)", fontSize: 12, boxShadow: "0 8px 24px -8px rgba(0,0,0,.25)",
}
const axis = { fontSize: 12, fill: "var(--muted-foreground)" }

function Panel({ title, hint, children, className = "" }: { title: string; hint: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mb-3 text-xs text-muted-foreground">{hint}</p>
      {children}
    </div>
  )
}

export default function BudgetCharts({ categories, expenses }: { categories: CategoryRow[]; expenses: ExpenseRow[] }) {
  const cats = categories.filter((c) => c.allocated > 0 || c.spend > 0)
  const byDay = new Map<string, number>()
  for (const e of expenses) {
    if (!e.createdAt) continue
    const d = new Date(e.createdAt)
    if (Number.isNaN(d.getTime())) continue
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + e.amount)
  }
  const trend: { day: string; total: number }[] = []
  let running = 0
  for (const [day, amount] of [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    running += amount
    trend.push({ day: new Date(day).toLocaleDateString(undefined, { month: "short", day: "numeric" }), total: running })
  }
  if (cats.length === 0 && trend.length === 0) return null

  return (
    <div className="mb-4 grid gap-4 lg:grid-cols-3">
      <Panel title="Where the budget goes" hint="Share of the allocated funds by category.">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={cats} dataKey="allocated" nameKey="category" innerRadius="58%" outerRadius="88%" paddingAngle={3} stroke="var(--card)" strokeWidth={2}>
                {cats.map((c, i) => <Cell key={c.category} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {cats.map((c, i) => (
            <li key={c.category} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{c.category}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Allocated vs spent" hint="How much of each category's budget is used." className="lg:col-span-2">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cats} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="category" tick={axis} tickLine={false} axisLine={false} />
              <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={compact} width={44} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.5 }} formatter={(v) => money(Number(v))} />
              <Bar dataKey="allocated" name="Allocated" fill="var(--chart-2)" fillOpacity={0.35} radius={[6, 6, 0, 0]} />
              <Bar dataKey="spend" name="Spent" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {trend.length > 1 && (
        <Panel title="Spending over time" hint="Running total of maintenance expenses." className="lg:col-span-3">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={compact} width={44} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
                <Area type="monotone" dataKey="total" name="Total spent" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#spendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </div>
  )
}
