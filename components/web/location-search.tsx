"use client"

import { useEffect, useState } from 'react'
interface LocationResult{
    label : string,
    lat: number,
    lng : number
}



const LocationSearch = ({onSelect,setTitle} : {onSelect : (loc : LocationResult)=>void,setTitle : (title : string)=>void }) => {

    const [query,setQuery]=useState<string>("")
    const [loading,setLoading]=useState(false)
    const [open,setOpen]=useState(false)
    const [result,setResult]=useState<LocationResult[]>([])

    useEffect(()=>{
        if(!query || query?.trim().length<3){
            setResult([])
            return 
        }

        setLoading(true)

        const timeout=setTimeout(async()=>{
            const res=await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
            const data=await res.json()
            setResult(data.results)
            setLoading(false)
            setOpen(true)
        },400)

        return ()=> clearTimeout(timeout)
    },[query])
  return (
    <div className='relative'>
        <input
         value={query}
         onChange={(e)=>setQuery(e.target.value)}
         placeholder='Search a street or area in Karachi'
         className="flex h-10 w-full rounded-xl border border-zinc-200 
         bg-white px-3 py-2 text-sm text-zinc-900 
         focus:outline-none focus:ring-2 focus:ring-teal-600/20" />

         {loading &&  <span className="absolute right-3 top-2.5 text-xs text-zinc-400">…</span>}

         {open && result?.length>0 && (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                {result.map((r,i)=>(
                    <li key={i}
                    onClick={()=>{
                        onSelect(r)
                        setOpen(false)
                        setQuery(r.label)
                        setTitle(r.label)
                        
                    }}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                        {r.label}
                    </li>
                ))}
            </ul>
         )}
    </div>
  )
}

export default LocationSearch
