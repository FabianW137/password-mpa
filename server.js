import express from 'express';
import fetch from 'node-fetch';
const app = express(); const PORT = process.env.PORT || 3000;
const BACKEND = process.env.BACKEND_URL;
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.get('/', (req,res)=> res.render('index'));
app.post('/login', async (req,res)=>{
  const r = await fetch(BACKEND + '/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:req.body.email, password:req.body.password})});
  if(!r.ok) return res.render('index', {error:'Login fehlgeschlagen'});
  const data = await r.json();
  res.redirect(`/totp?tmp=${encodeURIComponent(data.tmpToken)}`);
});
app.get('/totp', (req,res)=> res.render('totp', {tmp:req.query.tmp}));
app.post('/totp', async (req,res)=>{
  const r = await fetch(BACKEND + '/api/auth/totp-verify', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tmpToken:req.body.tmp, code:req.body.code})});
  if(!r.ok) return res.render('totp', {tmp:req.body.tmp, error:'TOTP ungültig'});
  const data = await r.json();
  res.redirect('/vault?token='+encodeURIComponent(data.token));
});
app.get('/vault', async (req,res)=>{
  const r = await fetch(BACKEND + '/api/vault', {headers:{Authorization:'Bearer '+req.query.token}});
  const items = r.ok ? await r.json() : [];
  res.render('vault', {items, token:req.query.token});
});
app.post('/vault', async (req,res)=>{
  await fetch(BACKEND + '/api/vault', {method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+req.body.token}, body: JSON.stringify({title:req.body.title, username:req.body.username, password:req.body.password, url:req.body.url, notes:req.body.notes})});
  res.redirect('/vault?token='+encodeURIComponent(req.body.token));
});
app.listen(PORT, ()=> console.log('MPA on', PORT));
