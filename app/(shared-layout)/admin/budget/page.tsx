"use client"
import React, { useState } from 'react'


// interface ExpenseProp {
//     reportId : string,
//     label : string,
//     category : string,
//     amount : number
// }
const BudgetPage = () => {

    const [expenses,setExpenses]=useState([])

    const fetchExpenses=async()=>{
        const res=await fetch(`/api/admin/budget`)
        const data=await res.json()
        setExpenses(data.expenses)
        console.log(data.expenses)
    }
    useEfect(()=>{
        fetchExpenses()
    },[])

  return (
    <div>
        This is budget Page!!
    </div>
  )
}

export default BudgetPage
function useEfect(arg0: () => void, arg1: never[]) {
    throw new Error('Function not implemented.')
}

