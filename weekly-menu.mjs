import { getStore } from "@netlify/blobs";
import recipes from "../../svezzy-recipes.json";

const blocked = /\b(ceci|cece|lenticchie|lenticchia|fagioli|fagiolo|piselli|pisello|soia|tofu|tempeh|arachidi|arachide|anacardi|anacardio|legumi|hummus|lupini|lupino|edamame)\b/i;
const vague = /da verificare|da consultare|ingredienti .*verificare|eventuali ingredienti|altri ingredienti|secondo la fonte|secondo ricetta/i;
const family = [
  "Pasta al pomodoro e ricotta", "Frittata di zucchine con patate", "Riso con pollo e verdure",
  "Salmone al forno con patate e broccoli", "Polpette morbide al sugo", "Risotto alla zucca",
  "Merluzzo con carote e patate", "Muffin salati alle verdure", "Pasta con crema di zucca",
  "Pollo al forno con finocchi", "Torta salata con zucchine e ricotta", "Cous cous con tacchino e verdure"
];
function mondayKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0,10);
}
function nextMondayKey(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days = (8 - d.getUTCDay()) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0,10);
}
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function buildMenu() {
 const fromSvezzy=recipes.filter(r=>{
   const ingredients=String(r.ingredients||'');
   return ingredients.length>8 && !blocked.test(`${r.name} ${ingredients}`) && !vague.test(ingredients);
 }).map(r=>r.name);
 const pool=[...new Set([...family.filter(n=>!blocked.test(n)),...fromSvezzy])];
 const picks=shuffle(pool); const days=['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
 return days.map((day,i)=>({day,lunch:picks[(i*3+1)%picks.length],dinner:picks[(i*3)%picks.length],box:picks[(i*3+2)%picks.length]}));
}
export default async () => {
 const weekKey=nextMondayKey();
 const payload={weekKey, generatedAt:new Date().toISOString(), menu:buildMenu(), note:'Bozza automatica: verificare sempre ingredienti, allergeni, contaminazioni crociate e adattamenti per Olivia.'};
 const store=getStore('family-chef-menus');
 await store.setJSON(weekKey,payload);
 return new Response(JSON.stringify({ok:true,weekKey}),{headers:{'Content-Type':'application/json'}});
};
export const config = { schedule: "0 7 * * 0" };
