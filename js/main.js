window.App={
  page:'dashboard', menuOpen:false,
  isOwner(){return !!CC.user && (CC.user.isOwner===true || (CC.user.roles||[]).includes('owner_admin'));},
  can(r){return this.isOwner() || (CC.user.roles||[]).includes('institution_admin') || (CC.user.roles||[]).includes(r);},
  navItems(){let items=[...Nav.items]; if(this.isOwner()) items.push(['roles','👑','Owner Admin']); return items;},
  start(){
    authRoot.classList.add('hidden'); appRoot.classList.remove('hidden');
    let items=this.navItems();
    appRoot.innerHTML=`<div class="shell"><aside class="sidebar"><div class="nav-brand">● CONNECT CAMPUS</div>${items.map(x=>`<button class="nav-item" data-page="${x[0]}" onclick="Nav.go('${x[0]}')">${x[1]} <span>${x[2]}</span></button>`).join('')}<button class="nav-item" onclick="Auth.logout()">↪ Sign out</button></aside><div class="drawer-backdrop" onclick="App.closeMenu()"></div><aside class="mobile-drawer"><div class="drawer-head"><b>CONNECT CAMPUS</b><button class="icon-btn" onclick="App.closeMenu()">✕</button></div>${items.map(x=>`<button class="nav-item" data-page="${x[0]}" onclick="Nav.go('${x[0]}');App.closeMenu()">${x[1]} <span>${x[2]}</span></button>`).join('')}<button class="nav-item" onclick="Auth.logout()">↪ Sign out</button></aside><main class="content"><header class="topbar"><div class="row"><button class="menu-btn" onclick="App.openMenu()">☰</button><div><b>${CC.user.name||'User'}</b><div class="small">${CC.data.profile.institution||'Connect Campus'}</div></div></div><div class="row"><button class="btn secondary" onclick="Nav.go('notifications')">🔔 <span id="unread"></span></button></div></header><div id="pageRoot"></div></main></div>`;
    this.render();
    if(FB.enabled&&FB.listenNotices){ if(this.unsubNotice)this.unsubNotice(); this.unsubNotice=FB.listenNotices(rows=>{CC.data.notices=rows;CC.save();if(this.page==='notices'||this.page==='dashboard')this.render()}); }
  },
  openMenu(){appRoot.classList.add('menu-open')}, closeMenu(){appRoot.classList.remove('menu-open')},
  async render(){
    let f={dashboard:Dashboard,timetable:Timetable,notices:Notices,materials:Materials,groups:Groups,lostfound:LostFound,notifications:Notifications,profile:Profile,roles:Roles,settings:Settings}[this.page]||Dashboard;
    try{ let html=f.render(); if(html&&typeof html.then==='function') html=await html; pageRoot.innerHTML=html; }
    catch(e){ pageRoot.innerHTML=`<section class="page"><h1>Unable to load this page</h1><div class="card"><p class="small">${UI.esc(e.message||String(e))}</p></div></section>`; }
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===this.page));
    let n=(CC.data.notifications||[]).filter(x=>!x.read).length,u=document.getElementById('unread');if(u)u.textContent=n?'('+n+')':'';
  }
};
Auth.init();
