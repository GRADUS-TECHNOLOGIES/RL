import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { createResetPasswordHandler, recoveryHash } from '../api/controllers/passwordRecovery.js';

function response() { return { statusCode:200, status(n){this.statusCode=n;return this}, json(body){this.body=body;return this} }; }
function fixture() {
  const code=randomBytes(32).toString('base64url');
  const user={_id:'synthetic',isAdmin:true,password:'old',recoveryTokenHash:recoveryHash(code),recoveryExpiresAt:new Date('2030-01-01')};
  const UserModel={findOneAndUpdate:async (query, update)=>{
    if(user.recoveryTokenHash!==query.recoveryTokenHash || !(user.recoveryExpiresAt>query.recoveryExpiresAt.$gt)) return null;
    user.password=update.$set.password;delete user.recoveryTokenHash;delete user.recoveryExpiresAt;return {_id:user._id};
  }};
  const handler=createResetPasswordHandler({UserModel,hashPassword:p=>bcrypt.hash(p,4),now:()=>new Date('2029-01-01')});
  const request=async (body={code,password:'new safe password'})=>{const res=response();await handler({body},res,e=>{throw e});return res};
  return {code,user,request};
}
test('recuperación cambia solo contraseña y consume código, preservando administrador e ID',async()=>{
  const f=fixture();assert.equal((await f.request()).statusCode,200);assert.equal(await bcrypt.compare('new safe password',f.user.password),true);
  assert.equal(f.user.isAdmin,true);assert.equal(f.user._id,'synthetic');assert.equal((await f.request()).statusCode,400);
});
test('rechaza códigos vencidos, inválidos y contraseñas no aceptables',async()=>{
  const f=fixture();f.user.recoveryExpiresAt=new Date('2028-01-01');assert.equal((await f.request()).statusCode,400);
  assert.equal((await f.request({code:'bad',password:'new safe password'})).statusCode,400);
  assert.equal((await f.request({code:f.code,password:'short'})).statusCode,400);
  assert.equal((await f.request({code:f.code,password:'a'.repeat(73)})).statusCode,400);
});
test('un código no puede consumirse dos veces simultáneamente',async()=>{
  const f=fixture();const results=await Promise.all([f.request(),f.request()]);assert.deepEqual(results.map(r=>r.statusCode).sort(),[200,400]);
});
