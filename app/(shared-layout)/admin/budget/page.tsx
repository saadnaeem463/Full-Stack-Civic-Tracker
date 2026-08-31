"use client"
import BudgetAllocation from '@/components/web/budget-allocation'
import CategoryBudgetAllocation from '@/components/web/cat-budget'
import React, { useState, useEffect } from 'react'

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
    const [loading,setLoading]=useState(true)

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
        Promise.all([fetchBudget(),fetchExpenses(),fetchExpensesByCat()]).finally(()=>{
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
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
            <p className="text-sm text-neutral-400">Loading budget…</p>
        </div>
    )
    }

    return (
        <div className="min-h-screen bg-[#F5F3EC] px-6 py-10 sm:px-10">
            
            <div className="mx-auto max-w-4xl">
                {!budget ? (
                    <div className="rounded-2xl border border-black/5 bg-white p-8">
                        <p className="mb-4 text-lg font-medium text-neutral-800">Decide the total budget</p>
                        <BudgetAllocation handleSetBudget={handleSetBudget} />
                    </div>
                ) : !isCatBudAllocated ? (
                    <div className="rounded-2xl border border-black/5 bg-white p-8">
                        <p className="mb-4 text-lg font-medium text-neutral-800">Allocate budget by category</p>
                        <CategoryBudgetAllocation
                            remainingCategories={remainingCategories}
                            onAllocated={handleCategoryAllocation}
                            budget={budget}
                        />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold tracking-widest text-neutral-500">
                                MAINTENANCE FUNDS
                            </p>
                            <h1 className="mt-1 font-serif text-4xl text-neutral-900">Budget</h1>
                            <p className="mt-2 max-w-md text-sm text-neutral-500">
                                How the maintenance allocation is being consumed across the four service categories.
                            </p>
                        </div>

                        {/* Remaining this year */}
                        <div className="mb-4 rounded-2xl border border-black/5 bg-white p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-widest text-neutral-500">
                                        REMAINING THIS YEAR
                                    </p>
                                    <p className="mt-1 text-5xl font-semibold text-[#2F5233]">
                                        {formatCurrency(remainingBudget)}
                                    </p>
                                </div>
                                <div className="flex gap-8 pt-1 text-right">
                                    <div>
                                        <p className="text-xs text-neutral-500">Total budget</p>
                                        <p className="font-medium text-neutral-900">{formatCurrency(budget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Total Allocated budget</p>
                                        <p className="font-medium text-neutral-900">{formatCurrency(totalAllocated)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Spent</p>
                                        <p className="font-medium text-neutral-900">{formatCurrency(totalSpend)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-500">Unallocated</p>
                                        <p className="font-medium text-neutral-900">{formatCurrency(unallocatedBudget)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                                <div
                                    className="h-full rounded-full bg-[#2F5233] transition-all"
                                    style={{ width: `${pctCommitted}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-neutral-500">
                                {Math.round(pctCommitted)}% of the annual maintenance budget committed.
                            </p>
                        </div>

                        {/* Allocation by category */}
                        <div className="mb-4 rounded-2xl border border-black/5 bg-white p-6">
                            <p className="font-medium text-neutral-900">Allocation by category</p>
                            <p className="mb-5 text-sm text-neutral-500">Spend against each service line.</p>

                            <div className="space-y-5">
                                {orderedCats.map((cat) => {
                                    const pct = cat.allocated > 0 ? Math.min(100, (cat.spend / cat.allocated) * 100) : 0
                                    const isWarning = pct / 100 >= WARNING_THRESHOLD
                                    return (
                                        <div key={cat.category}>
                                            <div className="mb-2 flex items-baseline justify-between">
                                                <p className="font-medium text-neutral-900">{cat.category}</p>
                                                <p className="text-sm text-neutral-500">
                                                    {formatCurrency(cat.spend)} of {formatCurrency(cat.allocated)}
                                                </p>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isWarning ? "bg-[#E08A2C]" : "bg-[#A9C1AC]"
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
                        <div className="rounded-2xl border border-black/5 bg-white p-6">
                            <p className="font-medium text-neutral-900">Recent expenses</p>
                            <p className="mb-3 text-sm text-neutral-500">Costs recorded against resolved and active reports.</p>

                            <div className="divide-y divide-neutral-100">
                                {recentExpenses.length === 0 && (
                                    <p className="py-4 text-sm text-neutral-400">No expenses recorded yet.</p>
                                )}
                                {recentExpenses.map((exp) => (
                                    <div key={exp._id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-neutral-900">{exp.label}</p>
                                            <p className="text-xs text-neutral-500">
                                                {exp.reportId} · {exp.category} · {formatDate(exp.createdAt)}
                                            </p>
                                        </div>
                                        <p className="font-medium text-neutral-900">{formatCurrency(exp.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}