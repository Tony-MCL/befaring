'use client'
{projects.map(p => (
<li key={p.id} style={{marginBottom:8}}>
<button className={`button ${activeId===p.id?'':'secondary'}`} onClick={()=>setActiveId(p.id)}>
{p.name}
</button>
</li>
))}
</ul>


{role === 'leder' && (
<form className="mt-3" onSubmit={onCreateProject}>
<h3>Opprett prosjekt</h3>
<label>Navn</label>
<input name="name" className="input" required />
<label className="mt-2">Beskrivelse</label>
<textarea name="desc" className="textarea" rows={3}></textarea>
<button className="button mt-2" type="submit">Opprett</button>
</form>
)}
</div>


<div className="card">
{!active ? (
<p>Velg et prosjekt for detaljvisning.</p>
) : (
<div>
<h2>{active.name}</h2>
<p style={{whiteSpace:'pre-wrap'}}>{active.desc || ''}</p>


{role === 'leder' && (
<div className="mt-3">
<h3>Tildel tilgang</h3>
<form onSubmit={onInvite} style={{display:'flex', gap:8}}>
<input name="email" className="input" placeholder="bruker@domene.no" />
<button className="button" type="submit">Legg til</button>
</form>
<div className="mt-2">
<strong>Tilganger</strong>
<ul style={{listStyle:'none', padding:0}}>
{(active.members||[]).map((m:any)=> (
<li key={m.uid} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.35rem 0'}}>
<span>{m.email || m.uid}</span>
<button className="button ghost" onClick={()=>onKick(m.uid)}>Fjern</button>
</li>
))}
</ul>
</div>
</div>
)}


<div className="mt-3">
<h3>Dokumentasjon & bilder</h3>
<p>Last opp bilder direkte til prosjektalbum. På mobil kan du bruke kamera.
</p>
<input type="file" accept="image/*" multiple capture="environment" onChange={onUpload} />
<ProjectAlbum projectId={active.id} fetcher={listProjectImages} />
</div>


<div className="mt-3">
<h3>Notater</h3>
<form onSubmit={onSaveNote}>
<textarea name="text" className="textarea" rows={3} placeholder="Skriv et notat…"></textarea>
<button className="button mt-2" type="submit">Lagre notat</button>
</form>
<ul className="mt-2" style={{listStyle:'none', padding:0}}>
{(active.notes||[]).map((n:any)=> (
<li key={n.id} className="card" style={{marginTop:8}}>
<div style={{fontSize:'.85rem',color:'var(--mcl-muted)'}}>{new Date(n.ts).toLocaleString()}</div>
<div style={{whiteSpace:'pre-wrap'}}>{n.text}</div>
</li>
))}
</ul>
</div>
</div>
)}
</div>
</section>
)
}
