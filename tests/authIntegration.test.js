import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateKeyPairSync } from 'node:crypto';
import User from '../api/models/user.model.js';
import { signin } from '../api/controllers/auth.controller.js';
import { verifyFirebaseToken } from '../api/utils/firebaseAuth.js';
import { app } from '../api/index.js';

test('inicio tradicional comprueba contraseña y emite cookie HttpOnly', async () => {
  const original=User.findOne; const secret=process.env.JWT_SECRET; process.env.JWT_SECRET='test-only-secret';
  const password=await bcrypt.hash('correct',4); User.findOne=async()=>({_id:'test',isAdmin:false,password,_doc:{_id:'test',password,isAdmin:false}});
  const response={statusCode:200,status(n){this.statusCode=n;return this},cookie(name,value,options){this.cookieData={name,value,options};return this},json(body){this.body=body;return this}};
  try { await signin({body:{email:'test@example.test',password:'correct'}},response,e=>{throw e}); assert.equal(response.statusCode,200); assert.equal(response.cookieData.options.httpOnly,true); assert.equal(response.body.password,undefined); assert.equal(jwt.verify(response.cookieData.value,process.env.JWT_SECRET).id,'test'); }
  finally { User.findOne=original; process.env.JWT_SECRET=secret; }
});
test('Firebase Admin rechaza token de otro proyecto', async () => {
  process.env.FIREBASE_PROJECT_ID='rl-isolated-test';
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  const token=jwt.sign({sub:'user',aud:'other-project',iss:'https://securetoken.google.com/other-project',auth_time:Math.floor(Date.now()/1000)},privateKey,{algorithm:'RS256',keyid:'fake',expiresIn:'5m'});
  await assert.rejects(verifyFirebaseToken(token));
});
test('sesión es obligatoria y usuario no admin no crea publicaciones', async () => {
  process.env.JWT_SECRET='test-only-secret';
  const server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
  try {
    const base=`http://127.0.0.1:${server.address().port}`;
    const headers={'Content-Type':'application/json'};
    assert.equal((await fetch(`${base}/api/auth/link-google`,{method:'POST',headers,body:'{}'})).status,401);
    const token=jwt.sign({id:'test',isAdmin:false},process.env.JWT_SECRET,{expiresIn:'1m'});
    assert.equal((await fetch(`${base}/api/post/create`,{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`},body:'{}'})).status,403);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
