'use client'
const members = (data.memberUids||[]).map((u:string)=> ({ uid:u, email: (data.memberEmails||{})[u] || '' }))
const notes = data.notes || []
items.push({ id:d.id, name:data.name, desc:data.desc, members, notes })
}
set(items)
})
}


export async function createProject({ name, desc }: { name:string, desc?:string }){
ensureFirebaseReady()
const db = getFirestore()
const auth = getAuth()
const col = collection(db, 'projects')
const docRef = await addDoc(col, {
name, desc: desc||'',
createdAt: serverTimestamp(),
ownerUid: auth.currentUser?.uid || 'owner',
memberUids: [auth.currentUser?.uid || 'owner'],
memberEmails: auth.currentUser?.email ? { [auth.currentUser.uid]: auth.currentUser.email } : {},
notes: []
})
return docRef.id
}


export async function addUserToProject(projectId: string, email: string){
ensureFirebaseReady()
const db = getFirestore()
const ref = doc(db, 'projects', projectId)
// Minimal: we store email keyed by itself (no lookup). In real flow, resolve email -> uid separately.
const snap = await getDoc(ref)
const data = snap.data() || {}
const fakeUid = email // until a proper user creation flow exists
await updateDoc(ref, {
memberUids: arrayUnion(fakeUid),
memberEmails: { ...(data as any).memberEmails, [fakeUid]: email }
})
}


export async function removeUserFromProject(projectId: string, uid: string){
ensureFirebaseReady()
const db = getFirestore()
const ref = doc(db, 'projects', projectId)
const snap = await getDoc(ref)
const data = snap.data() || {}
const emails = { ...(data as any).memberEmails }
delete (emails as any)[uid]
await updateDoc(ref, { memberUids: arrayRemove(uid), memberEmails: emails })
}


export async function uploadProjectImages(projectId: string, files: FileList){
ensureFirebaseReady()
const st = getStorage()
const out: string[] = []
for (const f of Array.from(files)){
const key = `projects/${projectId}/images/${Date.now()}-${f.name}`
const r = ref(st, key)
await uploadBytes(r, f)
out.push(await getDownloadURL(r))
}
return out
}


export async function listProjectImages(projectId: string){
ensureFirebaseReady()
if (cfg.projectId==='demo'){
return [ { url: `${(process as any).env.NEXT_PUBLIC_BASE_PATH || ''}/images/demo.jpg`, name: 'demo' } ]
}
const st = getStorage()
const r = ref(st, `projects/${projectId}/images`)
const res = await listAll(r)
const urls = await Promise.all(res.items.map(i => getDownloadURL(i)))
return urls.map((u, i)=> ({ url:u, name: res.items[i].name }))
}


export async function saveProjectNote(projectId: string, text: string){
ensureFirebaseReady()
const db = getFirestore()
const ref = doc(db, 'projects', projectId)
const snap = await getDoc(ref)
const data = (snap.data()||{}) as any
const notes = data.notes || []
notes.unshift({ id: crypto.randomUUID(), text, ts: Date.now() })
await setDoc(ref, { ...data, notes }, { merge: true })
}
