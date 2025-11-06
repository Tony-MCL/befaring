'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'


type Dict = Record<string,string>
const no: Dict = {
projects: 'Prosjekter'
}
const en: Dict = {
projects: 'Projects'
}


type Ctx = { lang: 'no'|'en', t: (k:string)=>string, setLang: (l:'no'|'en')=>void }
const C = createContext<Ctx>({ lang:'no', t:(k)=>k, setLang: ()=>{} })


export function I18nProvider({ children }: { children: React.ReactNode }){
const [lang, setLang] = useState<'no'|'en'>(typeof window!== 'undefined' && (localStorage.getItem('lang') as 'no'|'en') || 'no')
const t = (k:string)=> (lang==='no'? no: en)[k] || k
const value = useMemo(()=>({ lang, t, setLang: (l:'no'|'en')=> { setLang(l); localStorage.setItem('lang', l) } }), [lang])
return <C.Provider value={value}>{children}</C.Provider>
}
export function useI18n(){ return useContext(C) }
