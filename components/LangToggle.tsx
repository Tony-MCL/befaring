'use client'
import { useI18n } from '@/lib/i18n'


export function LangToggle(){
const { lang, setLang } = useI18n()
return (
<button className="button ghost" onClick={()=> setLang(lang==='no'?'en':'no')}>
{lang==='no'?'NO':'EN'}
</button>
)
}
