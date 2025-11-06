'use client'
import { useEffect, useState } from 'react'


export function ThemeToggle() {
const [mode, setMode] = useState<'light'|'dark'>(()=> (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')==='dark') ? 'dark':'light')
useEffect(()=>{
document.documentElement.setAttribute('data-theme', mode==='dark' ? 'dark' : 'light')
if (mode==='dark') { localStorage.setItem('theme','dark') } else { localStorage.removeItem('theme') }
},[mode])
useEffect(()=>{
const saved = localStorage.getItem('theme')
if (saved==='dark') setMode('dark')
},[])
return (
<button className="button ghost" onClick={()=>setMode(m=> m==='dark'?'light':'dark')}>
{mode==='dark'?'☀️':'🌙'}
</button>
)
}
