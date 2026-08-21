"use client"
import React, { useState,useEffect } from 'react'


interface ExpenseProp {
    _id: string,
    reportId : string,
    label : string,
    category : string,
    amount : number
}
export default function BudgetPage() {

    const [expenses,setExpenses]=useState<ExpenseProp[]>([])

    const fetchExpenses=async()=>{
        const res=await fetch(`/api/admin/budget`)
        const data=await res.json()
        setExpenses(data.expenses)
        console.log(data.expenses)
    }
    useEffect(()=>{
        fetchExpenses()
    },[])

  return (
    <div>
        This is budget Page!!
        {expenses.length > 0 && <>
        {expenses.map((exp)=>(
            <div key={exp._id}>
                {exp.amount}
            </div>
        ))}
        </>}
    </div>
  )
}

// export default BudgetPage

