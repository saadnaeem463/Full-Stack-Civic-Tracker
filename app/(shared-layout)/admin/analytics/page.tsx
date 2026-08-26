"use client"
import React, { useEffect, useState } from 'react'

const AnalyticsPage = () => {

    const [result,setResult]=useState()

    const fetchAnalyticsData=async()=>{
        try {
            const res=await fetch(`/api/admin/analytics`)
            const data=await res.json()
            console.log(data)
        } catch (error) {
            console.log("error : ",error)
        }
    }
    useEffect(()=>{
        fetchAnalyticsData()
    },[])
  return (
    <div>This is Analytics page</div>
  )
}

export default AnalyticsPage