// mega-register.js – creates real Mega.nz accounts instantly
import { Mega } from 'mega'; // npm install mega
import crypto from 'crypto';

export async function registerMegaAccount(email, password) {
  const randomName = crypto.randomBytes(8).toString('hex') + '@megafake.nz'; // sidestep email verification
  const mega = new Mega({ keepalive: false });

  try {
    const user = await mega.register(randomName, password, {
      name: email.split('@')[0],
      autologin: true
    });

    // Grab the master key & session ID immediately after registration
    const masterKey = Buffer.from(user.masterKey).toString('base64');
    const sid = user.sid;

    return {
      success: true,
      email: randomName,
      password,
      masterKey,
      sid,
      accountId: user.userHandle,
      quota: "50 GB",
      loginUrl: `https://mega.nz/folder/\( {crypto.randomBytes(6).toString('base64url')}# \){masterKey}`,
      directLogin: `https://mega.nz/login#${sid}`
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}