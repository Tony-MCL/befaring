'use client'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import {
  useAuth,
  ensureFirebaseReady,
  listUserProjects,
  createProject,
  addUserToProject,
  removeUserFromProject,
  uploadProjectImages,
  listProjectImages,
  saveProjectNote
} from '@/lib/firebase'
import { ProjectAlbum } from '@/components/ProjectAlbum'

export type Role = 'leder' | 'felt'

export default function Page() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [role, setRole] = useState<Role>('leder')
  const [projects, setProjects] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = useMemo(() => projects.find(p => p.id === activeId), [projects, activeId])

  useEffect(() => {
    ensureFirebaseReady()
    if (!user) return
    const unsub = listUserProjects(user.uid, setProjects)
    return () => { if (typeof unsub === 'function') unsub() }
  }, [user])

  async function onCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '').trim()
    const desc = String(fd.get('desc') || '').trim()
    if (!name) return
    const id = await createProject({ name, desc })
    setActiveId(id)
    e.currentTarget.reset()
  }

  async function onInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '').trim().toLowerCase()
    if (!activeId || !email) return
    await addUserToProject(activeId, email)
    e.currentTarget.reset()
  }

  async function onKick(uid: string) {
    if (!activeId) return
    await removeUserFromProject(activeId, uid)
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeId || !e.target.files?.length) return
    await uploadProjectImages(activeId, e.target.files)
  }

  async function onSaveNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = String(fd.get('text') || '').trim()
    if (!activeId || !text) return
    await saveProjectNote(activeId, text)
    e.currentTarget.reset()
  }

  return (
    <section className="grid two">
      <div className="card">
        <h2>{t('projects')}</h2>

        <div className="mt-2" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>Rolle</label>
          <select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value="leder">Prosjektleder</option>
            <option value="felt">Befaring</option>
          </select>
        </div>

        <ul className="mt-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {projects.map(p => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <button
                className={`button ${activeId === p.id ? '' : 'secondary'}`}
                onClick={() => setActiveId(p.id)}
              >
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
            <textarea name="desc" className="textarea" rows={3} />
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
            <p style={{ whiteSpace: 'pre-wrap' }}>{active.desc || ''}</p>

            {role === 'leder' && (
              <div className="mt-3">
                <h3>Tildel tilgang</h3>
                <form onSubmit={onInvite} style={{ display: 'flex', gap: 8 }}>
                  <input name="email" className="input" placeholder="bruker@domene.no" />
                  <button className="button" type="submit">Legg til</button>
                </form>
                <div className="mt-2">
                  <strong>Tilganger</strong>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {(active.members || []).map((m: any) => (
                      <li key={m.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.35rem 0' }}>
                        <span>{m.email || m.uid}</span>
                        <button className="button ghost" type="button" onClick={() => onKick(m.uid)}>Fjern</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-3">
              <h3>Dokumentasjon & bilder</h3>
              <p>Last opp bilder direkte til prosjektalbum. På mobil kan du bruke kamera.</p>
              <input type="file" accept="image/*" multiple capture="environment" onChange={onUpload} />
              <ProjectAlbum projectId={active.id} fetcher={listProjectImages} />
            </div>

            <div className="mt-3">
              <h3>Notater</h3>
              <form onSubmit={onSaveNote}>
                <textarea name="text" className="textarea" rows={3} placeholder="Skriv et notat…" />
                <button className="button mt-2" type="submit">Lagre notat</button>
              </form>
              <ul className="mt-2" style={{ listStyle: 'none', padding: 0 }}>
                {(active.notes || []).map((n: any) => (
                  <li key={n.id} className="card" style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '.85rem', color: 'var(--mcl-muted)' }}>
                      {new Date(n.ts).toLocaleString()}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
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
