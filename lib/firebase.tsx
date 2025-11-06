'use client'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth'
import {
  getFirestore, collection, addDoc, doc, onSnapshot, serverTimestamp,
  setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'
import React, { createContext, useContext, useEffect, useState } from 'react'

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN || 'demo.local',
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID || 'demo',
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE || 'demo',
  messagingSenderId: process.env.NEXT_PUBLIC_FB_SENDER || '0',
  appId: process.env.NEXT_PUBLIC_FB_APP_ID || '0:demo:web:demo'
}

let appInitialized = false
export function ensureFirebaseReady() {
  if (!getApps().length && !appInitialized) {
    initializeApp(cfg)
    appInitialized = true
  }
}

// ---- Auth context
type AuthCtx = { user: User | null; signInAnon: () => Promise<void>; signOutUser: () => Promise<void> }
const AC = createContext<AuthCtx>({ user: null, signInAnon: async () => {}, signOutUser: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  ensureFirebaseReady()
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, setUser)
  }, [])
  async function signInAnon() { await signInAnonymously(getAuth()) }
  async function signOutUser() { await signOut(getAuth()) }
  return <AC.Provider value={{ user, signInAnon, signOutUser }}>{children}</AC.Provider>
}
export function useAuth() { return useContext(AC) }

// ---- Data access
export function listUserProjects(uid: string, set: (items: any[]) => void) {
  ensureFirebaseReady()
  const db = getFirestore()

  // Demo-modus (uten ekte Firebase-nøkler)
  if (cfg.projectId === 'demo') {
    const demo = [
      { id: 'demo-1', name: 'Demo-prosjekt', desc: 'Les og test UI', members: [{ uid: 'demo', email: 'demo@mcl.local' }], notes: [] }
    ]
    set(demo)
    return () => {}
  }

  const col = collection(db, 'projects')
  const qy = query(col, where('memberUids', 'array-contains', uid))
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data() as any
      const members = (data.memberUids ?? []).map((u: string) => ({
        uid: u,
        email: (data.memberEmails ?? {})[u] ?? ''
      }))
      const notes = data.notes ?? []
      return { id: d.id, name: data.name, desc: data.desc, members, notes }
    })
    set(items)
  })
}

export async function createProject({ name, desc }: { name: string; desc?: string }) {
  ensureFirebaseReady()
  const db = getFirestore()
  const auth = getAuth()
  const col = collection(db, 'projects')
  const docRef = await addDoc(col, {
    name,
    desc: desc || '',
    createdAt: serverTimestamp(),
    ownerUid: auth.currentUser?.uid || 'owner',
    memberUids: [auth.currentUser?.uid || 'owner'],
    memberEmails: auth.currentUser?.email ? { [auth.currentUser.uid]: auth.currentUser.email } : {},
    notes: []
  })
  return docRef.id
}

// Midlertidig: bruker e-post som “uid” inntil vi kobler ekte brukere
export async function addUserToProject(projectId: string, email: string) {
  ensureFirebaseReady()
  const db = getFirestore()
  const refDoc = doc(db, 'projects', projectId)
  const snap = await getDoc(refDoc)
  const data = (snap.data() || {}) as any
  const fakeUid = email
  await updateDoc(refDoc, {
    memberUids: arrayUnion(fakeUid),
    memberEmails: { ...(data.memberEmails || {}), [fakeUid]: email }
  })
}

export async function removeUserFromProject(projectId: string, uid: string) {
  ensureFirebaseReady()
  const db = getFirestore()
  const refDoc = doc(db, 'projects', projectId)
  const snap = await getDoc(refDoc)
  const data = (snap.data() || {}) as any
  const emails = { ...(data.memberEmails || {}) }
  delete (emails as any)[uid]
  await updateDoc(refDoc, { memberUids: arrayRemove(uid), memberEmails: emails })
}

export async function uploadProjectImages(projectId: string, files: FileList) {
  ensureFirebaseReady()
  if (cfg.projectId === 'demo') return [] // no-op i demo
  const st = getStorage()
  const out: string[] = []
  for (const f of Array.from(files)) {
    const key = `projects/${projectId}/images/${Date.now()}-${f.name}`
    const r = ref(st, key)
    await uploadBytes(r, f)
    out.push(await getDownloadURL(r))
  }
  return out
}

export async function listProjectImages(projectId: string) {
  ensureFirebaseReady()
  if (cfg.projectId === 'demo') {
    return [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/demo.jpg`, name: 'demo' }]
  }
  const st = getStorage()
  const r = ref(st, `projects/${projectId}/images`)
  const res = await listAll(r)
  const urls = await Promise.all(res.items.map((i) => getDownloadURL(i)))
  return urls.map((u, i) => ({ url: u, name: res.items[i].name }))
}

export async function saveProjectNote(projectId: string, text: string) {
  ensureFirebaseReady()
  const db = getFirestore()
  const refDoc = doc(db, 'projects', projectId)
  const snap = await getDoc(refDoc)
  const data = (snap.data() || {}) as any
  const notes = Array.isArray(data.notes) ? data.notes.slice() : []
  notes.unshift({ id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`), text, ts: Date.now() })
  await setDoc(refDoc, { ...data, notes }, { merge: true })
}
