"use client"
import React, { useState,useEffect } from 'react'


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
    useEffect(()=>{
        fetchExpenses()
    },[])

  return (
    <div>
        This is budget Page!!
    </div>
  )
}

export default BudgetPage

