'use client'
import { useAuth } from '@/lib/firebase'


export default function Page() {
const { user, signInAnon, signOutUser } = useAuth()
return (
<section className="card">
<h1>Portal</h1>
<p>Autentisering kan aktiveres her (e-post/passord eller anonym for rask test).</n+p>
{user ? (
<div>
<p>Innlogget som {user.uid}</p>
<button className="button" onClick={signOutUser}>Logg ut</button>
</div>
) : (
<button className="button" onClick={signInAnon}>Hurtig innlogging (anonym)</button>
)}
</section>
)
}
