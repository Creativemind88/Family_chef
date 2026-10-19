const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='familyChef_redesign_v2';
const DAYS=['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
const weekStart=()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d};
const fmt=d=>d.toLocaleDateString('it-IT',{day:'numeric',month:'long'});
const weekKey=()=>{const d=weekStart();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const familyRecipes=[
{name:'Pasta al pomodoro e ricotta',ingredients:['pasta','passata di pomodoro','ricotta','olio extravergine d’oliva'],time:20,steps:'Cuoci la pasta. Scalda la passata con poco olio, poi spegni e manteca con la ricotta. Preleva la porzione di Olivia prima di aggiungere sale.',source:'Ricetta base Family Chef'},
{name:'Frittata di zucchine con patate',ingredients:['uova','zucchine','patate','olio extravergine d’oliva'],time:30,steps:'Cuoci le patate e le zucchine finché morbide. Uniscile alle uova sbattute e cuoci completamente in padella o al forno.',source:'Ricetta base Family Chef'},
{name:'Riso con pollo e verdure',ingredients:['riso','pollo','carote','zucchine'],time:30,steps:'Cuoci riso, pollo e verdure separatamente o in un’unica preparazione. Il pollo deve essere completamente cotto. Raffredda rapidamente l’eventuale porzione da conservare.',source:'Ricetta base Family Chef'},
{name:'Salmone al forno con patate e broccoli',ingredients:['salmone','patate','broccoli','olio extravergine d’oliva'],time:35,steps:'Cuoci in forno finché pesce e verdure sono ben cotti e morbidi. Controlla accuratamente l’assenza di lische.',source:'Ricetta base Family Chef'},
{name:'Polpette morbide al sugo',ingredients:['manzo','uovo','passata di pomodoro'],time:35,steps:'Prepara polpette morbide e cuocile completamente nel sugo. Adatta consistenza e dimensioni alla persona che le mangerà.',source:'Ricetta base Family Chef'},
{name:'Risotto alla zucca',ingredients:['riso','zucca','parmigiano','olio extravergine d’oliva'],time:30,steps:'Cuoci la zucca, aggiungi il riso e porta a cottura aggiungendo acqua calda poco alla volta. Manteca con parmigiano a fuoco spento.',source:'Ricetta base Family Chef'},
{name:'Merluzzo con carote e patate',ingredients:['merluzzo','carote','patate','olio extravergine d’oliva'],time:25,steps:'Cuoci al vapore o al forno fino a completa cottura. Controlla con cura l’assenza di lische.',source:'Ricetta base Family Chef'},
{name:'Muffin salati alle verdure',ingredients:['uova','farina','zucchine','ricotta'],time:30,steps:'Mescola uova, farina, zucchine cotte e ricotta. Distribuisci negli stampi e cuoci a 180 °C fino a completa cottura.',source:'Ricetta base Family Chef'},
{name:'Pasta con crema di zucca',ingredients:['pasta','zucca','ricotta','olio extravergine d’oliva'],time:25,steps:'Cuoci la zucca fino a renderla morbida e frullala con ricotta e un filo d’olio. Condisci la pasta cotta.',source:'Ricetta base Family Chef'},
{name:'Pollo al forno con finocchi',ingredients:['pollo','finocchi','patate','olio extravergine d’oliva'],time:40,steps:'Taglia le verdure, condiscile con poco olio e cuoci in forno insieme al pollo fino a completa cottura.',source:'Ricetta base Family Chef'},
{name:'Torta salata con zucchine e ricotta',ingredients:['pasta sfoglia','zucchine','ricotta','uova'],time:40,steps:'Cuoci le zucchine, mescolale con ricotta e uova, versa nel guscio di pasta sfoglia e cuoci fino a doratura e completa cottura.',source:'Ricetta base Family Chef'},
{name:'Cous cous con tacchino e verdure',ingredients:['cous cous','tacchino','carote','zucchine'],time:25,steps:'Cuoci completamente il tacchino e le verdure. Reidrata il cous cous secondo la confezione e mescola. Per i prodotti confezionati controlla sempre gli allergeni.',source:'Ricetta base Family Chef'}
];
let state=load();
const initiallySavedMenuWeeks = new Set(Object.keys(state.menus || {}));
let activeRecipe=null, activeMealIndex=null;
function load(){
 try{
  const old=JSON.parse(localStorage.getItem(KEY)||'null');
  if(old)return {...{menus:{},cooked:[],favorites:[],recipes:[],shopping:[]},...old};
  const legacy=JSON.parse(localStorage.getItem('familyChef_v1')||'null');
  return {menus:{},cooked:[],favorites:[],recipes:[],shopping:[],legacyAvailable:!!legacy};
 }catch{return {menus:{},cooked:[],favorites:[],recipes:[],shopping:[]}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderAll()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function go(view){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+view));window.scrollTo({top:0,behavior:'smooth'})}
$$('.tab').forEach(b=>b.onclick=()=>go(b.dataset.view));$('#settingsBtn').onclick=()=>go('settings');
function currentMenu(){const key=weekKey();if(!state.menus[key])state.menus[key]=buildWeeklyMenu();return state.menus[key]}
function allergenBlocked(recipe){
 const text=(recipe.name+' '+(Array.isArray(recipe.ingredients)?recipe.ingredients.join(' '):recipe.ingredients||'')).toLowerCase();
 // Conservative keyword screen only: it cannot guarantee absence of hidden ingredients or cross-contact.
 return /\b(ceci|cece|lenticchie|lenticchia|fagioli|fagiolo|piselli|pisello|soia|tofu|tempeh|arachidi|arachide|anacardi|anacardio|legumi|hummus|lupini|lupino|edamame)\b/.test(text);
}
function usableSvezzyRecipes(){
 return (window.SVEZZY_RECIPES||[]).filter(r=>{
  const ing=String(r.ingredients||'').trim();
  const vague=/da verificare|da consultare|ingredienti .*verificare|eventuali ingredienti|altri ingredienti|secondo la fonte|secondo ricetta/i.test(ing);
  return ing.length>8 && !vague && !allergenBlocked(r);
 }).map(r=>({name:r.name,ingredients:String(r.ingredients||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean),steps:r.steps||'',time:r.time,source:r.source||'Svezzy',dataStatus:r.dataStatus,ageNotes:r.ageNotes,sourceUrl:r.sourceUrl}));
}
function menuCandidates(){
 const all=[...familyRecipes,...usableSvezzyRecipes()];
 const seen=new Set();
 return all.filter(r=>!allergenBlocked(r)&&!seen.has(r.name)&&(seen.add(r.name),true));
}
function buildWeeklyMenu(){
 const pool=menuCandidates();
 const shuffled=[...pool].sort(()=>Math.random()-.5);
 const pick=(i)=>shuffled[i%shuffled.length]?.name||'Da pianificare';
 return DAYS.map((day,i)=>({day,lunch:pick(i*3+1),dinner:pick(i*3),box:pick(i*3+2)}));
}
function formatWeek(){const a=weekStart(),b=new Date(a);b.setDate(a.getDate()+6);$('#weekTitle').textContent='Settimana corrente';$('#weekRange').textContent=`Dal ${fmt(a)} al ${fmt(b)} ${b.getFullYear()}`;$('#todayLabel').textContent=`OGGI È ${new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'}).toLocaleUpperCase('it-IT')}`}
function recipeForName(name){
 const all=[...familyRecipes,...(window.SVEZZY_RECIPES||[]).map(r=>({name:r.name,ingredients:String(r.ingredients||'').split(/[;,]/).map(x=>x.trim()).filter(Boolean),steps:r.steps||'',time:r.time,source:r.source||'Svezzy',dataStatus:r.dataStatus,ageNotes:r.ageNotes,sourceUrl:r.sourceUrl})),...state.recipes];
 return all.find(r=>r.name===name)||{name,ingredients:[],steps:'Questa voce del menu non ha ancora una scheda ricetta associata. Puoi modificarla e aggiungere i dettagli quando la cucini.',source:'Menu'}
}
function recipeButton(name,dayIndex,mealKey,label,extra=''){return `<button type="button" class="meal-block meal-open ${extra}" data-name="${encodeURIComponent(name)}" data-day="${dayIndex}" data-meal="${mealKey}" aria-label="Apri ${esc(label)}: ${esc(name||'Da pianificare')}"><span class="meal-label">${esc(label)}</span><span class="meal-recipe">${esc(name||'Da pianificare')}</span><svg class="meal-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>`}
function renderMenu(){
 const menu=currentMenu();
 $('#menuList').innerHTML=menu.map((m,i)=>`<article class="week-day"><header><div><div class="eyebrow">${esc(m.day)}</div><h3>${esc(new Date(weekStart().getTime()+i*86400000).toLocaleDateString('it-IT',{day:'numeric',month:'long'}))}</h3></div><button class="small-btn edit-day" data-i="${i}">Modifica giorno</button></header><div class="meal-columns">${recipeButton(m.lunch,i,'lunch','Pranzo')}${recipeButton(m.dinner,i,'dinner','Cena','dinner')}${recipeButton(m.box,i,'box','Schiscetta')}</div></article>`).join('');
 $$('.meal-open').forEach(b=>b.onclick=()=>{activeMealIndex={day:+b.dataset.day,meal:b.dataset.meal};openRecipe(decodeURIComponent(b.dataset.name))});
 $$('.edit-day').forEach(b=>b.onclick=()=>editDay(+b.dataset.i));
 $('#mealCount').textContent=menu.length;
}
function editDay(i){const m=currentMenu()[i];const lunch=prompt('Pranzo',m.lunch);if(lunch===null)return;const dinner=prompt('Cena',m.dinner);if(dinner===null)return;const box=prompt('Schiscetta',m.box);if(box===null)return;Object.assign(m,{lunch:lunch.trim(),dinner:dinner.trim(),box:box.trim()});save();toast('Giornata aggiornata')}
function rotateMenu(){
 const key=weekKey();
 state.menus[key]=buildWeeklyMenu();
 save();toast('Nuova bozza creata dal catalogo: verifica sempre ingredienti e allergeni')
}
$('#generateMenu').onclick=rotateMenu;$('#changeMenu').onclick=rotateMenu;
function openRecipe(name){
 activeRecipe=recipeForName(name);
 $('#recipeDialogTitle').textContent=activeRecipe.name;
 const ing=Array.isArray(activeRecipe.ingredients)?activeRecipe.ingredients:[];
 $('#recipeDialogBody').innerHTML=`<p><strong>Ingredienti</strong></p><p>${ing.length?esc(ing.join(', ')):'Ingredienti da completare.'}</p><p><strong>Preparazione</strong></p><p>${esc(activeRecipe.steps||'Procedimento non disponibile: da verificare.')}</p><p><strong>Tempo</strong></p><p>${esc(activeRecipe.time||'Da verificare')}${activeRecipe.time?' minuti':''}</p><p><strong>Fonte</strong></p><p>${esc(activeRecipe.source||'Non indicata')}</p>${activeRecipe.dataStatus?`<p><strong>Stato dati</strong></p><p>${esc(activeRecipe.dataStatus)}</p>`:''}${activeRecipe.ageNotes?`<p><strong>Età e attenzioni riportate nella scheda</strong></p><p>${esc(activeRecipe.ageNotes)}</p>`:''}${activeRecipe.sourceUrl?`<p><a href="${esc(activeRecipe.sourceUrl)}" target="_blank" rel="noopener">Apri fonte originale</a></p>`:''}<p class="muted tiny">Per il papà, verifica sempre ingredienti composti, allergeni e rischio di contatto crociato. Per Olivia adatta consistenza, taglio e cottura.</p>`;
 $('#favoriteToggle').textContent=state.favorites.includes(activeRecipe.name)?'Rimuovi dai preferiti':'Aggiungi ai preferiti';
 $('#markCooked').textContent=state.cooked.some(x=>x.name===activeRecipe.name&&x.week!==weekKey())?'Già nell’archivio':'Segna come cucinata';
 $('#recipeDialog').showModal();
}
$('#favoriteToggle').onclick=()=>{if(!activeRecipe)return;const n=activeRecipe.name;state.favorites=state.favorites.includes(n)?state.favorites.filter(x=>x!==n):[...state.favorites,n];save();$('#favoriteToggle').textContent=state.favorites.includes(n)?'Rimuovi dai preferiti':'Aggiungi ai preferiti';toast('Preferiti aggiornati')};
$('#markCooked').onclick=()=>{if(!activeRecipe)return;const item={name:activeRecipe.name,week:weekKey(),recipe:activeRecipe};state.cooked=state.cooked.filter(x=>!(x.name===item.name&&x.week===item.week));state.cooked.push(item);save();toast('Ricetta segnata come cucinata');};
function renderRecipes(){
 const q=($('#recipeSearch').value||'').toLowerCase();
 const prior=state.cooked.filter(x=>x.week!==weekKey()).filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i).filter(x=>x.name.toLowerCase().includes(q));
 $('#recipeList').innerHTML=prior.length?prior.map(x=>`<article class="recipe-card"><h3><button class="recipe-title" data-name="${encodeURIComponent(x.name)}">${esc(x.name)}</button></h3><p class="muted">Cucinata in una settimana precedente</p></article>`).join(''):'<div class="empty">Nessuna ricetta archiviata. Quando segnerai una ricetta come cucinata, comparirà qui dopo la fine della settimana corrente.</div>';
 $$('.recipe-title').forEach(b=>b.onclick=()=>openRecipe(decodeURIComponent(b.dataset.name)));
 $('#cookedCount').textContent=prior.length;
}
function renderFavorites(){
 const fav=state.favorites.map(name=>({name,recipe:recipeForName(name)}));
 $('#favoriteList').innerHTML=fav.length?fav.map(x=>`<article class="recipe-card"><h3><button class="recipe-title" data-name="${encodeURIComponent(x.name)}">${esc(x.name)}</button></h3><p>${esc((x.recipe.ingredients||[]).join(', '))}</p></article>`).join(''):'<div class="empty">Non hai ancora ricette preferite. Apri una ricetta e tocca “Aggiungi ai preferiti”.</div>';
 $$('.recipe-title').forEach(b=>b.onclick=()=>openRecipe(decodeURIComponent(b.dataset.name)));
}
$('#recipeSearch').oninput=renderRecipes;
$('#addRecipeBtn').onclick=()=>$('#addDialog').showModal();
$('#addForm').onsubmit=e=>{e.preventDefault();const r={name:$('#newRecipeName').value.trim(),ingredients:$('#newRecipeIngredients').value.split(',').map(x=>x.trim()).filter(Boolean),steps:$('#newRecipeSteps').value.trim(),time:$('#newRecipeTime').value||'',source:'Ricetta personale'};state.recipes.push(r);$('#addDialog').close();e.target.reset();save();toast('Ricetta salvata');};
$('#makeShopping').onclick=()=>{const menu=currentMenu();const items=[...new Set(menu.flatMap(m=>[m.lunch,m.dinner,m.box]).filter(Boolean))];state.shopping=items.map(name=>({id:Date.now()+Math.random(),name,checked:false,category:'Da pianificare'}));save();go('shopping');toast('Aggiunti i piatti alla lista: completa gli ingredienti e le quantità')};
$('#shoppingForm').onsubmit=e=>{e.preventDefault();const name=$('#shoppingInput').value.trim();if(!name)return;state.shopping.push({id:Date.now(),name,checked:false});$('#shoppingInput').value='';save()};
function renderShopping(){
 $('#shoppingList').innerHTML=state.shopping.length?state.shopping.map(x=>`<div class="shopping-row"><label><input type="checkbox" data-id="${x.id}" ${x.checked?'checked':''}><span class="${x.checked?'checked':''}">${esc(x.name)}</span></label><button class="delete-btn del-shopping" data-id="${x.id}" aria-label="Elimina">×</button></div>`).join(''):'<div class="empty">La lista è vuota. Aggiungi i prodotti da comprare.</div>';
 $$('#shoppingList input[type=checkbox]').forEach(b=>b.onchange=()=>{const x=state.shopping.find(x=>String(x.id)===b.dataset.id);if(x)x.checked=b.checked;save()});
 $$('.del-shopping').forEach(b=>b.onclick=()=>{state.shopping=state.shopping.filter(x=>String(x.id)!==b.dataset.id);save()});
 $('#shoppingCount').textContent=state.shopping.filter(x=>!x.checked).length;
}
$('#clearChecked').onclick=()=>{state.shopping=state.shopping.filter(x=>!x.checked);save()};
$('#exportList').onclick=()=>{const txt=state.shopping.filter(x=>!x.checked).map(x=>'- '+x.name).join('\n');if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>toast('Lista copiata')).catch(()=>prompt('Copia la lista',txt));else prompt('Copia la lista',txt)};
$('#exportData').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='family-chef-dati.json';a.click();URL.revokeObjectURL(a.href)};
$('#clearData').onclick=()=>{if(confirm('Vuoi cancellare menu, preferiti, ricette cucinate e lista della spesa salvati su questo dispositivo?')){localStorage.removeItem(KEY);state={menus:{},cooked:[],favorites:[],recipes:[],shopping:[]};save();toast('Dati cancellati')}};
function renderAll(){formatWeek();renderMenu();renderRecipes();renderFavorites();renderShopping()}
renderAll();
// If a menu was generated by the Sunday Netlify function, load it when this week's menu is not already saved locally.
(async function loadScheduledMenu(){
 try {
  const key=weekKey();
  const response=await fetch('/.netlify/functions/menu?week='+encodeURIComponent(key),{headers:{'Accept':'application/json'}});
  if(!response.ok)return;
  const payload=await response.json();
  if(payload && payload.weekKey===key && Array.isArray(payload.menu) && payload.menu.length===7 && !initiallySavedMenuWeeks.has(key)){
   state.menus[key]=payload.menu; localStorage.setItem(KEY,JSON.stringify(state)); renderAll();
   toast('Menu settimanale caricato dal servizio online');
  }
 } catch(e) { console.info('Menu online non disponibile; uso la bozza locale.'); }
})();
