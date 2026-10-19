FAMILY CHEF V5 — SERVIZIO MENU SETTIMANALE

CONTENUTO
- App PWA e catalogo Svezzy (JSON incluso)
- Funzione Netlify programmata ogni domenica alle 07:00 UTC (09:00 in Italia durante l’ora legale; 08:00 durante l’ora solare)
- Archivio online tramite Netlify Blobs
- Endpoint che permette all’app di leggere il menu generato per la settimana corrente

IMPORTANTE PRIMA DI PUBBLICARE
1. Questa versione richiede un deploy Netlify tramite repository Git e build, non il semplice caricamento manuale della sola cartella statica.
2. Il repository collegato deve contenere TUTTI i file e le cartelle di questo pacchetto nella root del repository: index.html, app.js, styles.css, svezzy-data.js, svezzy-recipes.json, manifest.json, sw.js, icon.svg, netlify.toml, package.json e netlify/functions/.
3. Netlify deve installare le dipendenze da package.json e pubblicare la root (netlify.toml incluso).
4. Dopo il deploy, verificare nei log delle funzioni che weekly-menu sia presente e che l’endpoint /.netlify/functions/menu?week=YYYY-MM-DD risponda. La funzione schedulata genera la bozza per il lunedì successivo; l’app la carica quando la settimana corrispondente è iniziata e se non ha già un menu locale salvato.
5. Non è stata eseguita una prova live sul tuo account Netlify: l’automazione NON va considerata attiva finché il deploy e i log non sono verificati.

LIMITI E SICUREZZA
- La selezione è deterministica/randomizzata e non usa un modello AI esterno.
- Il filtro per parole chiave è solo preliminare, non certifica la sicurezza allergologica. Verificare sempre ingredienti completi, etichette e contaminazioni crociate; le schede incomplete non sono prova di assenza di allergeni.
- Il menu online è condiviso come bozza settimanale; modifiche locali restano nel browser/dispositivo e non vengono risincronizzate al backend in questa versione.
- Le schede Svezzy possono avere quantità o istruzioni da verificare. Adattare tagli, consistenze e cotture per Olivia e togliere la sua porzione prima di aggiungere sale.
- La lista della spesa rimane un elenco di piatti, non una lista ingredienti con quantità automatiche.
