import { getStore } from "@netlify/blobs";
export default async (request) => {
 const url=new URL(request.url); const requested=url.searchParams.get('week');
 if(!requested || !/^\d{4}-\d{2}-\d{2}$/.test(requested)) return new Response(JSON.stringify({error:'Parametro week non valido'}),{status:400,headers:{'Content-Type':'application/json'}});
 try {
  const store=getStore('family-chef-menus');
  const payload=await store.get(requested,{type:'json'});
  if(!payload) return new Response(JSON.stringify({weekKey:requested,menu:null}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  return new Response(JSON.stringify(payload),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 } catch(e) {
  return new Response(JSON.stringify({error:'Menu online non ancora disponibile'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }
};
