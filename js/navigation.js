window.Nav={
  items:[
    ['dashboard','⌂','Dashboard'],
    ['timetable','▦','Timetable'],
    ['notices','▣','Notices'],
    ['materials','▤','Materials'],
    ['groups','◉','Groups'],
    ['lostfound','⌕','Lost & Found'],
    ['notifications','♢','Notifications'],
    ['profile','◌','Profile'],
    ['settings','⚙','Settings']
  ],
  valid(page){
    return ['dashboard','timetable','notices','materials','groups','lostfound','notifications','profile','roles','settings'].includes(page);
  },
  go(page, options={}){
    if(!this.valid(page)) page='dashboard';
    const push = options.push !== false;
    if(App.page===page){
      App.closeMenu();
      return;
    }
    App.page=page;
    if(push && window.history && history.pushState){
      const url=new URL(window.location.href);
      url.searchParams.set('page',page);
      history.pushState({connectCampus:true,page:page},'',url.pathname+url.search+url.hash);
    }
    document.querySelectorAll('.nav-item,.mobile-nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
    App.closeMenu();
    App.render();
  },
  initHistory(){
    const params=new URLSearchParams(location.search);
    let initial=params.get('page');
    if(!this.valid(initial) || (initial==='roles' && !App.isOwner())) initial='dashboard';
    App.page=initial;
    if(window.history && history.replaceState){
      const url=new URL(window.location.href);
      url.searchParams.set('page',initial);
      history.replaceState({connectCampus:true,page:initial},'',url.pathname+url.search+url.hash);
    }
    window.addEventListener('popstate',(event)=>{
      let page=event.state && event.state.connectCampus ? event.state.page : new URLSearchParams(location.search).get('page');
      if(!this.valid(page) || (page==='roles' && !App.isOwner())) page='dashboard';
      App.page=page;
      App.closeMenu();
      App.render();
    });
  }
};