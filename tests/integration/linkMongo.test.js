import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createLinkFirebaseHandler } from '../../api/controllers/linkFirebase.js';
import { hasFirebaseUidIndex } from '../../api/utils/firebaseUidIndex.js';
import { createResetPasswordHandler, recoveryHash } from '../../api/controllers/passwordRecovery.js';
import { randomBytes } from 'node:crypto';

test('MongoDB aplica unicidad atómica de Firebase UID', async () => {
  const uri = process.env.TEST_MONGODB_URI || '';
  if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):27017\/rl_security_test$/.test(uri)) throw new Error('Se requiere MongoDB local aislado rl_security_test');
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000, autoIndex: false }).asPromise();
  try {
    const User=connection.model('LinkTestUser',new mongoose.Schema({password:String,firebaseUid:String,isAdmin:Boolean}), 'link_test_users');
    await User.collection.createIndex({firebaseUid:1},{unique:true,partialFilterExpression:{firebaseUid:{$type:'string'}},name:'firebase_uid_unique'});
    const password=await bcrypt.hash('test-password', 4);
    const admin=await User.create({password,isAdmin:true}); const other=await User.create({password,isAdmin:false});
    const handler=createLinkFirebaseHandler({ User, bcrypt, hasFirebaseUidIndex, verifyFirebaseToken:async()=>({uid:'same-test-uid',email_verified:true,auth_time:Math.floor(Date.now()/1000),firebase:{sign_in_provider:'google.com'}}) });
    const execute=async user => { const response={statusCode:200,status(n){this.statusCode=n;return this},json(){return this}}; await handler({user:{id:user.id},body:{password:'test-password',idToken:'test'}},response,error=>{throw error});return response.statusCode; };
    assert.deepEqual((await Promise.all([execute(admin),execute(other)])).sort(), [200,409]);
    assert.equal(await User.countDocuments({firebaseUid:'same-test-uid'}),1);
    assert.equal((await User.findById(admin.id)).isAdmin,true);
  } finally { await connection.close(); }
});

test('MongoDB consume una sola vez el código de recuperación bajo concurrencia', async () => {
  const uri=process.env.TEST_MONGODB_URI || '';
  if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):27017\/rl_security_test$/.test(uri)) throw new Error('Se requiere MongoDB local aislado');
  const connection=await mongoose.createConnection(uri,{serverSelectionTimeoutMS:5000,autoIndex:false}).asPromise();
  try {
    const User=connection.model('ResetTestUser',new mongoose.Schema({password:String,isAdmin:Boolean,recoveryTokenHash:String,recoveryExpiresAt:Date}),'reset_test_users');
    const code=randomBytes(32).toString('base64url');
    const admin=await User.create({password:'old',isAdmin:true,recoveryTokenHash:recoveryHash(code),recoveryExpiresAt:new Date(Date.now()+60000)});
    const handler=createResetPasswordHandler({UserModel:User,hashPassword:p=>bcrypt.hash(p,4)});
    const run=async()=>{const r={statusCode:200,status(n){this.statusCode=n;return this},json(){return this}};await handler({body:{code,password:'new safe password'}},r,e=>{throw e});return r.statusCode};
    assert.deepEqual((await Promise.all([run(),run()])).sort(),[200,400]);
    const updated=await User.findById(admin.id);assert.equal(updated.isAdmin,true);assert.equal(updated.recoveryTokenHash,undefined);assert.equal(await bcrypt.compare('new safe password',updated.password),true);
  } finally { await connection.close(); }
});
