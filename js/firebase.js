window.FB = {
  enabled:false, auth:null, db:null,
  async init(){
    const c=window.CC_FIREBASE_CONFIG||{};
    if(!c.apiKey||!c.projectId) return false;
    if(!firebase.apps.length) firebase.initializeApp(c);
    this.auth=firebase.auth(); this.db=firebase.firestore(); this.enabled=true; return true;
  },
  serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); },
  ownerEmail(){ return (window.CC_OWNER_GOOGLE_EMAIL||'').toLowerCase(); },
  isOwnerAuth(user){ return !!user && user.email && user.email.toLowerCase()===this.ownerEmail() && (user.providerData||[]).some(p=>p.providerId==='google.com'); },
  async usernameAvailable(username){
    username=(username||'').trim().toLowerCase();
    if(!username) return false;
    const s=await this.db.collection('usernames').doc(username).get();
    return !s.exists;
  },
  async emailForUsername(username){
    const s=await this.db.collection('usernames').doc((username||'').trim().toLowerCase()).get();
    if(!s.exists) throw new Error('Username not found.');
    return s.data().email;
  },
  async claimUsername(username,user){
    username=(username||'').trim().toLowerCase();
    if(!/^[a-z0-9._-]{3,24}$/.test(username)) throw new Error('Username must be 3–24 characters and use only letters, numbers, dots, underscores or hyphens.');
    const ref=this.db.collection('usernames').doc(username);
    await this.db.runTransaction(async tx=>{
      const s=await tx.get(ref);
      if(s.exists && s.data().uid!==user.uid) throw new Error('This username is already taken.');
      tx.set(ref,{uid:user.uid,email:user.email||'',username,createdAt:this.serverTime()},{merge:true});
    });
    return username;
  },
  async ensureUser(user,profile){
    const ref=this.db.collection('users').doc(user.uid), snap=await ref.get();
    const username=(profile.username||'').trim().toLowerCase();
    const owner=this.isOwnerAuth(user);
    const provider=(user.providerData||[]).some(p=>p.providerId==='google.com')?'Google':'Password';
    if(!snap.exists){
      if(username) await this.claimUsername(username,user);
      await ref.set({uid:user.uid,name:user.displayName||profile.name||'',username,email:user.email||'',provider,createdAt:this.serverTime(),lastLoginAt:this.serverTime(),institution:profile.institution||'',department:profile.department||'',semester:profile.semester||'',roles:owner?['owner_admin']:['student']});
    }else{
      const old=snap.data();
      if(username && username!==old.username) await this.claimUsername(username,user);
      await ref.set({name:user.displayName||profile.name||old.name||'',username:username||old.username||'',email:user.email||old.email||'',provider,lastLoginAt:this.serverTime(),roles:owner?['owner_admin']:(old.roles||['student'])},{merge:true});
    }
    return (await ref.get()).data();
  },
  async users(){ const s=await this.db.collection('users').orderBy('createdAt','desc').limit(300).get(); return s.docs.map(d=>d.data()); },
  async assignRole(uid,role){ await this.db.collection('users').doc(uid).update({roles:firebase.firestore.FieldValue.arrayUnion(role)}); await this.db.collection('roleAudit').add({targetUid:uid,role,action:'assigned',by:CC.user.uid,createdAt:this.serverTime()}); },
  async removeRole(uid,role){ await this.db.collection('users').doc(uid).update({roles:firebase.firestore.FieldValue.arrayRemove(role)}); await this.db.collection('roleAudit').add({targetUid:uid,role,action:'removed',by:CC.user.uid,createdAt:this.serverTime()}); },
  listenNotices(cb){ return this.db.collection('notices').orderBy('createdAt','desc').onSnapshot(s=>cb(s.docs.map(d=>({ ...d.data(), id:d.id })))); },
  async addNotice(n){ await this.db.collection('notices').add({ ...n, authorUid:CC.user.uid, authorName:CC.user.name, createdAt:this.serverTime() }); },
  listenMessages(groupId,cb){ return this.db.collection('groups').doc(groupId).collection('messages').orderBy('createdAt','asc').onSnapshot(s=>cb(s.docs.map(d=>({ ...d.data(), id:d.id })))); },
  async sendMessage(groupId,text){ await this.db.collection('groups').doc(groupId).collection('messages').add({text,uid:CC.user.uid,name:CC.user.name,createdAt:this.serverTime()}); }
};
