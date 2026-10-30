import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createLinkFirebaseHandler } from '../../api/controllers/linkFirebase.js';
import { hasFirebaseUidIndex } from '../../api/utils/firebaseUidIndex.js';

test('MongoDB aplica unicidad atómica de Firebase UID', async () => {
  const uri = process.env.TEST_MONGODB_URI || '';
  if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):27017\/rl_security_test$/.test(uri)) throw new Error('Se requiere MongoDB local aislado rl_security_test');
  const connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000, autoIndex: false }).asPromise();
  try {
    const User=connection.model('LinkTestUser',new mongoose.Schema({password:String,firebaseUid:String,isAdmin:Boolean}), 'link_test_users');
    await User.collection.createIndex({firebaseUid:1},{unique:true,partialFilterExpression:{firebaseUid:{$type:'string'}},name:'firebase_uid_unique'});
    const password=await bcrypt.hash('test-password', 4);
    const admin=await User.create({password,isAdmin:true}); const other=await User.create({password,isAdmin:false});
    const handler=createLinkFirebaseHandler({ User, bcrypt, hasFirebaseUidIndex, verifyFirebaseToken:async()=>({uid:'same-test-uid',auth_time:Math.floor(Date.now()/1000),firebase:{sign_in_provider:'google.com'}}) });
    const execute=async user => { const response={statusCode:200,status(n){this.statusCode=n;return this},json(){return this}}; await handler({user:{id:user.id},body:{password:'test-password',idToken:'test'}},response,error=>{throw error});return response.statusCode; };
    assert.deepEqual((await Promise.all([execute(admin),execute(other)])).sort(), [200,409]);
    assert.equal(await User.countDocuments({firebaseUid:'same-test-uid'}),1);
    assert.equal((await User.findById(admin.id)).isAdmin,true);
  } finally { await connection.close(); }
});
