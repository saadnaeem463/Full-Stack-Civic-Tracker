"use client"
import BudgetAllocation from '@/components/web/budget-allocation'
import CategoryBudgetAllocation from '@/components/web/cat-budget'
import React, { useState,useEffect } from 'react'


interface ExpenseProp {
    _id: string,
    reportId : string,
    label : string,
    category : string,
    amount : number
}

interface ExpenseCat{
    category: string,
    spend : number
}
const CATEGORIES = ["Roads", "Lightning", "Cleanliness", "Parks"] as const;
type Category = (typeof CATEGORIES)[number];

export default function BudgetPage() {

    const [expenses,setExpenses]=useState<ExpenseProp[]>([])
    const [expensesByCat,setExpensesByCat]=useState<ExpenseCat[] | null >(null)
    const [budget,setBudget]=useState(0)
    const [allocatedCats,setAllocatedCats]=useState<Category[]>([])

    const remainingCategories = CATEGORIES.filter((c) => !allocatedCats.includes(c))
    const isCatBudAllocated = remainingCategories.length === 0

    const fetchBudget=async()=>{
        const res=await fetch(`/api/admin/budget`)
        const data=await res.json()
        setBudget(data.budget?.Amount)
        console.log("Budget : ",data.budget)
    }
    const fetchExpenses=async()=>{
        const res=await fetch(`/api/admin/budget/expenses`)
        const data=await res.json()
        setExpenses(data.expenses)
        console.log("Expenses : ",data.expenses)
    }

    const handleCategoryAllocation=(allocation : {category : Category,amount : number})=>{
        setAllocatedCats((prev)=>[...prev,allocation.category])
    }

    const fetchExpensesByCat=async()=>{
    const res=await fetch(`/api/admin/budget/category`)
    const data=await res.json()
    setExpensesByCat(data.expenses)
    setAllocatedCats((data.expenses ?? []).map((c: any) => c.category))

    console.log("Expenses By Category",data.expenses ?? null)
    }

    const handleSetBudget=(amount:number)=>{
        setBudget(amount)
    }
    useEffect(()=>{
        fetchBudget()
        fetchExpenses()
        fetchExpensesByCat()
    },[])

  return (
    <div>
        {!budget ? (<>
            <p>Decide the Total Budget</p>
            <BudgetAllocation handleSetBudget={handleSetBudget}/>
        </>) :(
            <>
                {!isCatBudAllocated ? (

                    <>
                        <p>Categories Budget is not alloacted</p>
                        <CategoryBudgetAllocation
                            remainingCategories={remainingCategories}
                            onAllocated={handleCategoryAllocation}
                            budget={budget}
                        />
                    </>

                ):(
                    <>
                    {expenses.length > 0 && <>
                    {expenses.map((exp)=>(
                        <div key={exp._id}>
                            {exp.amount}
                        </div>
                    ))}
                    </>}
                    </>
                )}

            </>
        )}
        This is budget Page!!
    </div>
  )
}

// export default BudgetPage

