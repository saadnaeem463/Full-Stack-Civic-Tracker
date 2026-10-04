"use client"
import BudgetAllocation from '@/components/web/budget-allocation'
import CategoryBudgetAllocation from '@/components/web/cat-budget'
import React, { useState, useEffect } from 'react'
import BudgetCharts from '@/components/web/budget-charts'
import PendingBudgetRequests from '@/components/web/admin/pending-budget-requests'
import { Button } from '@/components/ui/button'
import {
    EmptyState,
    PageHeading,
    PageLoading,
    eyebrowClass,
    pageContainer,
} from '@/components/web/admin/primitives'

interface ExpenseProp {
    _id: string
    reportId: string
    label: string
    category: string
    amount: number
    createdAt?: string
}

interface ExpenseCat {
    category: string
    spend: number
    allocated: number
}

const CATEGORIES = ["Roads", "Lightning", "Cleanliness", "Parks"] as const
type Category = (typeof CATEGORIES)[number]

const WARNING_THRESHOLD = 0.8 // % of category budget spent before bar goes amber

function formatCurrency(n: number) {
    return `$${Math.round(n).toLocaleString()}`
}

function formatDate(iso?: string) {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function BudgetPage() {
    const [expenses, setExpenses] = useState<ExpenseProp[]>([])
    const [expensesByCat, setExpensesByCat] = useState<ExpenseCat[] | null>(null)
    const [budget, setBudget] = useState(0)
    const [allocatedCats, setAllocatedCats] = useState<Category[]>([])
    const [totalAllocated, setTotalAllocated] = useState(0)
    const [totalSpend, setTotalSpend] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // How much of what's been handed out to categories is still unspent
    const remainingBudget = totalAllocated - totalSpend
    // How much of the total budget hasn't been assigned to any category at all
    const unallocatedBudget = budget - totalAllocated

    const remainingCategories = CATEGORIES.filter((c) => !allocatedCats.includes(c))
    const isCatBudAllocated = remainingCategories.length === 0

    const fetchBudget = async () => {
        const res = await fetch(`/api/admin/budget`)
        const data = await res.json()
        setBudget(data.budget?.Amount)
    }

    const fetchExpenses = async () => {
        const res = await fetch(`/api/admin/budget/expenses`)
        const data = await res.json()
        setExpenses(data.expenses ?? [])
    }

    const handleCategoryAllocation = (allocation: { category: Category; amount: number }) => {
        setAllocatedCats((prev) => [...prev, allocation.category])
    }

    const fetchExpensesByCat = async () => {
        const res = await fetch(`/api/admin/budget/category`)
        const data = await res.json()
        setExpensesByCat(data.expenses)
        setTotalAllocated(data.totalSpend?.totalAllocated ?? 0)
        setTotalSpend(data.totalSpend?.spend ?? 0)
        setAllocatedCats((data.expenses ?? []).map((c: any) => c.category))
    }

    const handleSetBudget = (amount: number) => {
        setBudget(amount)
    }

    useEffect(() => {
        Promise.all([fetchBudget(), fetchExpenses(), fetchExpensesByCat()])
            .catch(() => setError("Could not load the budget. Check your connection and try again."))
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const pctCommitted = totalAllocated > 0 ? Math.min(100, (totalSpend / totalAllocated) * 100) : 0

    // Order categories to match CATEGORIES, not whatever order the API returned
    const orderedCats = CATEGORIES
        .map((name) => (expensesByCat ?? []).find((c) => c.category === name))
        .filter((c): c is ExpenseCat => Boolean(c))

    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 6)

    if (loading) {
        return <PageLoading label="Loading budget…" />
    }

    if (error) {
        return (
            <div className={pageContainer}>
                <PageHeading
                    eyebrow="Financial control"
                    title="Budget"
                    description="Set the budget, allocate it across categories, and track every dirham spent."
                />
                <EmptyState title="We could not load the budget" description={error} />
                <div className="mt-4 flex justify-center">
                    <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                        Try again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={pageContainer}>
            {!budget ? (
                <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
                    <p className="mb-4 text-sm font-semibold tracking-tight text-foreground">Decide the total budget</p>
                    <BudgetAllocation handleSetBudget={handleSetBudget} />
                </div>
            ) : !isCatBudAllocated ? (
                <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
                    <p className="mb-4 text-sm font-semibold tracking-tight text-foreground">Allocate budget by category</p>
                    <CategoryBudgetAllocation
                        remainingCategories={remainingCategories}
                        onAllocated={handleCategoryAllocation}
                        budget={budget}
                    />
                </div>
            ) : (
                <>
                    <PageHeading
                        eyebrow="Maintenance funds"
                        title="Budget"
                        description="How the maintenance allocation is being consumed across the four service categories."
                    />

                    {/* Remaining this year */}
                    <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-xs">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                <div>
                                    <p className={eyebrowClass}>
                                        Remaining this year
                                    </p>
                                    <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">
                                        {formatCurrency(remainingBudget)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
                                    <div className="grid w-full grid-cols-1 gap-4 pt-1 text-right sm:flex-1 sm:grid-cols-2 xl:grid-cols-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total budget</p>
                                            <p className="font-medium text-foreground">{formatCurrency(budget)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Allocated budget</p>
                                            <p className="font-medium text-foreground">{formatCurrency(totalAllocated)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Spent</p>
                                            <p className="font-medium text-foreground">{formatCurrency(totalSpend)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Unallocated</p>
                                            <p className="font-medium text-foreground">{formatCurrency(unallocatedBudget)}</p>
                                        </div>
                                    </div>
                                    <BudgetAllocation variant="outline" handleSetBudget={(amount) => setBudget((prev) => prev + amount)} />
                                </div>
                            </div>

                            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${pctCommitted}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {Math.round(pctCommitted)}% of the annual maintenance budget committed.
                            </p>
                        </div>

                        {/* Pending budget requests */}
                        <PendingBudgetRequests onResolved={fetchExpensesByCat} />

                        {/* Charts */}
                        <BudgetCharts categories={expensesByCat ?? []} expenses={expenses} />

                        {/* Allocation by category */}
                        <div className="mb-4 rounded-lg border border-border bg-card p-5 shadow-xs">
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold tracking-tight text-foreground">Allocation by category</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Spend against each service line.</p>
                                </div>
                                <CategoryBudgetAllocation
                                    variant="outline"
                                    remainingCategories={CATEGORIES as unknown as Category[]}
                                    onAllocated={() => fetchExpensesByCat()}
                                    budget={unallocatedBudget}
                                />
                            </div>

                            <div className="space-y-5">
                                {orderedCats.map((cat) => {
                                    const pct = cat.allocated > 0 ? Math.min(100, (cat.spend / cat.allocated) * 100) : 0
                                    const isWarning = pct / 100 >= WARNING_THRESHOLD
                                    return (
                                        <div key={cat.category}>
                                            <div className="mb-2 flex items-baseline justify-between">
                                                <p className="font-medium text-foreground">{cat.category}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(cat.spend)} of {formatCurrency(cat.allocated)}
                                                </p>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isWarning ? "bg-warning" : "bg-primary/20"
                                                        }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Recent expenses */}
                        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
                            <p className="text-sm font-semibold tracking-tight text-foreground">Recent expenses</p>
                            <p className="mb-3 mt-1 text-xs text-muted-foreground">Costs recorded against resolved and active reports.</p>

                            <div className="divide-y divide-border">
                                {recentExpenses.length === 0 && (
                                    <p className="py-4 text-sm text-muted-foreground">No expenses recorded yet.</p>
                                )}
                                {recentExpenses.map((exp) => (
                                    <div key={exp._id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-foreground">{exp.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {exp.reportId} · {exp.category} · {formatDate(exp.createdAt)}
                                            </p>
                                        </div>
                                        <p className="font-medium text-foreground">{formatCurrency(exp.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
        </div>
    )
}