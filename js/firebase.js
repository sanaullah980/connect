window.FB = {
  enabled:false, auth:null, db:null,
  async init(){ const c=window.CC_FIREBASE_CONFIG||{}; if(!c.apiKey||!c.projectId) return false; firebase.initializeApp(c); this.auth=firebase.auth(); this.db=firebase.firestore(); this.enabled=true; return true; },
  serverTime(){ return firebase.firestore.FieldValue.serverTimestamp(); },
  async ensureUser(user,profile){
    const ref=this.db.collection('users').doc(user.uid); const snap=await ref.get();
    const admin=(window.CC_BOOTSTRAP_ADMIN_EMAILS||[]).map(x=>x.toLowerCase()).includes((user.email||'').toLowerCase());
    if(!snap.exists) await ref.set({uid:user.uid,name:user.displayName||profile.name||'',email:user.email||'',createdAt:this.serverTime(),institution:profile.institution||'',department:profile.department||'',semester:profile.semester||'',roles:admin?['institution_admin']:['student']});
    else if(admin && !((snap.data().roles)||[]).includes('institution_admin')) await ref.update({roles:firebase.firestore.FieldValue.arrayUnion('institution_admin')});
    return (await ref.get()).data();
  },
  async users(){ const s=await this.db.collection('users').orderBy('createdAt','desc').limit(200).get(); return s.docs.map(d=>d.data()); },
  async assignRole(uid,role){ await this.db.collection('users').doc(uid).update({roles:firebase.firestore.FieldValue.arrayUnion(role)}); await this.db.collection('roleAudit').add({targetUid:uid,role,action:'assigned',by:CC.user.uid,createdAt:this.serverTime()}); },
  async removeRole(uid,role){ await this.db.collection('users').doc(uid).update({roles:firebase.firestore.FieldValue.arrayRemove(role)}); await this.db.collection('roleAudit').add({targetUid:uid,role,action:'removed',by:CC.user.uid,createdAt:this.serverTime()}); },
  listenNotices(cb){ return this.db.collection('notices').orderBy('createdAt','desc').onSnapshot(s=>cb(s.docs.map(d=>({ ...d.data(), id:d.id })))); },
  async addNotice(n){ await this.db.collection('notices').add({ ...n, authorUid:CC.user.uid, authorName:CC.user.name, createdAt:this.serverTime() }); },
  listenMessages(groupId,cb){ return this.db.collection('groups').doc(groupId).collection('messages').orderBy('createdAt','asc').onSnapshot(s=>cb(s.docs.map(d=>({ ...d.data(), id:d.id })))); },
  async sendMessage(groupId,text){ await this.db.collection('groups').doc(groupId).collection('messages').add({text,uid:CC.user.uid,name:CC.user.name,createdAt:this.serverTime()}); }
};
