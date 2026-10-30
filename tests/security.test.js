import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { app } from '../api/index.js';
import { createGoogleHandler } from '../api/controllers/googleAuth.js';

async function request(path) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try { const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`); return { status: response.status, body: await response.json() }; }
  finally { await new Promise(resolve => server.close(resolve)); }
}
test('health and readiness reflect a disconnected database', async () => {
  assert.equal((await request('/healthz')).status, 200);
  assert.equal((await request('/readyz')).status, 503);
});
test('readiness reports connected state', async () => {
  const original = mongoose.connection.readyState;
  mongoose.connection.readyState = 1;
  try { assert.equal((await request('/readyz')).status, 200); }
  finally { mongoose.connection.readyState = original; }
});
function response() { return { statusCode: 200, status(n) { this.statusCode=n; return this; }, json(body) { this.body=body; return this; }, cookie() { return this; } }; }
const goodIdentity = { uid:'uid-1', email:'admin@example.test', email_verified:true, firebase:{sign_in_provider:'google.com'} };
async function run({ identity=goodIdentity, verificationError=false, existing=false, linked=false, token='token' }={}) {
  const operations=[];
  const user={_id:'1',isAdmin:true,toObject:()=>({_id:'1',isAdmin:true,password:'private'})};
  const User={ findOne: async query => { operations.push(query); return query.firebaseUid ? (linked ? user : null) : (existing ? user : null); }, create: async () => { throw Error('unexpected create'); } };
  const handler=createGoogleHandler({ User, verifyFirebaseToken: async () => { if(verificationError) throw Error('invalid'); return identity; }, jwt:{sign:()=> 'signed'}, logAuditEvent:()=>{} });
  const res=response(); await handler({body:{idToken:token,email:'forged@example.test'}},res,error=>{throw error}); return {res,operations};
}
test('rejects forged, expired or wrong-project tokens when verifier rejects', async () => { assert.equal((await run({verificationError:true})).res.statusCode,401); });
test('rejects unverified email and non-Google providers', async () => {
  assert.equal((await run({identity:{...goodIdentity,email_verified:false}})).res.statusCode,401);
  assert.equal((await run({identity:{...goodIdentity,firebase:{sign_in_provider:'password'}}})).res.statusCode,401);
});
test('never links an existing privileged account by email', async () => { const {res,operations}=await run({existing:true}); assert.equal(res.statusCode,403); assert.deepEqual(operations[1],{email:'admin@example.test'}); });
test('allows only an explicitly linked UID and omits password', async () => { const {res}=await run({linked:true}); assert.equal(res.statusCode,200); assert.equal(res.body.password,undefined); });
