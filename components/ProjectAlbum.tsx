'use client'
import { useEffect, useState } from 'react'


type Img = { url: string, name: string }


export function ProjectAlbum({ projectId, fetcher }: { projectId: string, fetcher: (projectId:string)=>Promise<Img[]> }){
const [items, setItems] = useState<Img[]>([])
useEffect(()=>{ fetcher(projectId).then(setItems) }, [projectId, fetcher])
return (
<div className="gallery mt-2">
{items.map(img => (
<a key={img.url} href={img.url} target="_blank" rel="noreferrer">
<img src={img.url} alt={img.name} />
</a>
))}
</div>
)
}
