/// <reference types="next" />
/// <reference types="next/image-types/global" />


// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information
```


---


## public/images/mcl-logo.png
*(plassholder – legg inn din logo med dette navnet)*


## public/images/demo.jpg
*(plassholder testbilde for demo)*


---


### Miljøvariabler (GiHub Pages / lokal dev)
Opprett `.env.local` for lokal kjøring (valgfritt):
```
NEXT_PUBLIC_FB_API_KEY=...
NEXT_PUBLIC_FB_AUTH_DOMAIN=...
NEXT_PUBLIC_FB_PROJECT_ID=...
NEXT_PUBLIC_FB_STORAGE=...
NEXT_PUBLIC_FB_SENDER=...
NEXT_PUBLIC_FB_APP_ID=...
```


For GitHub Actions settes `NEXT_PUBLIC_BASE_PATH` automatisk til `/${repo-navn}`. Hvis du kjører lokalt, la den være tom.


---


### Datastruktur (Firestore)
```
projects (collection)
{projectId} (doc)
name: string
desc: string
ownerUid: string
memberUids: string[] // uid, eller midlertidig email som uid
memberEmails: { [uid]: email }
notes: [{ id, text, ts }]
createdAt: Timestamp
```


### Flyt
- **Prosjektleder (PC):** Oppretter prosjekt, beskriver, legger til e-post i tilgang, laster opp bilder, skriver notater.
- **Felt (mobil):** Velger tildelt prosjekt, ser dokumentasjon/bilder, bruker kamera-opplasting (`capture="environment"`), kan laste opp flere bilder og lese/legge notat.


> Kamera direkte: På iOS/Android åpner `<input type="file" accept="image/*" capture="environment">` native kamera. Dette fungerer uten native wrapper.
