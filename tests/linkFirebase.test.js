import test from 'node:test';
import assert from 'node:assert/strict';
import { createLinkFirebaseHandler } from '../api/controllers/linkFirebase.js';
import { hasFirebaseUidIndex } from '../api/utils/firebaseUidIndex.js';

function res() { return { statusCode: 200, status(n) { this.statusCode=n; return this; }, json(body) { this.body=body; return this; } }; }
function fixture() {
  const users = new Map([['admin',{_id:'admin',password:'hash',isAdmin:true}],['other',{_id:'other',password:'hash',isAdmin:false}]]);
  const identity = {uid:'firebase-uid',auth_time:Math.floor(Date.now()/1000),firebase:{sign_in_provider:'google.com'}};
  const User = {
    findById: id => ({ select: async () => users.get(id) ? {...users.get(id)} : null }),
    findOneAndUpdate: async (query, update) => {
      const user=users.get(query._id);
      if (!user || user.password !== query.password || user.firebaseUid) return null;
      if ([...users.values()].some(u=>u.firebaseUid===update.$set.firebaseUid)) { const error=new Error('duplicate'); error.code=11000; throw error; }
      user.firebaseUid=update.$set.firebaseUid; return user;
    },
  };
  const handler=createLinkFirebaseHandler({ User, bcrypt:{compare:async p=>p==='correct'}, verifyFirebaseToken:async token=>{ if(token!=='valid') throw Error('invalid'); return identity; }, hasFirebaseUidIndex:async()=>true });
  async function request(user='admin', body={password:'correct',idToken:'valid'}) { const r=res(); await handler({user:user?{id:user}:undefined,body},r,e=>{throw e}); return r; }
  return { users, identity, request };
}
test('vincula cuenta administrativa sin alterar rol y rechaza reutilización', async()=>{
  const f=fixture(); assert.equal((await f.request()).statusCode,200); assert.equal(f.users.get('admin').isAdmin,true); assert.equal((await f.request()).statusCode,409);
});
test('exige sesión, contraseña y token válidos', async()=>{
  const f=fixture(); assert.equal((await f.request(null)).statusCode,401);
  assert.equal((await f.request('admin',{password:'bad',idToken:'valid'})).statusCode,401);
  for (const idToken of ['invalid','other-project']) assert.equal((await f.request('admin',{password:'correct',idToken})).statusCode,401);
  f.identity.auth_time-=301; assert.equal((await f.request()).statusCode,401);
});
test('UID no puede vincularse a dos cuentas aunque las peticiones sean simultáneas', async()=>{
  const f=fixture(); const responses=await Promise.all([f.request('admin'),f.request('other')]);
  assert.deepEqual(responses.map(r=>r.statusCode).sort(),[200,409]);
});
test('requiere índice único parcial exacto y rechaza índices inseguros', async()=>{
  const check = index => hasFirebaseUidIndex({collection:{indexes:async()=>[index]}});
  const expected={key:{firebaseUid:1},unique:true,partialFilterExpression:{firebaseUid:{$type:'string'}}};
  assert.equal(await check(expected),true); assert.equal(await check({...expected,unique:false}),false); assert.equal(await check({...expected,partialFilterExpression:{firebaseUid:{$exists:true}}}),false);
});
