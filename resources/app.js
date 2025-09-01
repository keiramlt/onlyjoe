const videos = [
  {
    id: 'locked',
    title: 'Locked & Shafted',
    file: 'videos/locked&shafted.mp4',
    poster: 'resources/locked&shaftedthumb.png',
    desc: 'Uploaded May 3, 2025 · 12 likes'
  },
  {
    id: 'scan',
    title: 'Got SCREWED by Scan',
    file: 'videos/Got SCREWED by Scan.mp4',
    poster: 'resources/Got SCREWED by Scan.png',
    desc: 'Uploaded May 5, 2025 · 8 likes'
  },
  {
    id: 'releases',
    title: 'Joe Finally Releases Everything',
    file: 'videos/Joe Finally Releases Everything.mp4',
    poster: 'resources/Joe Finally Releases Everything.png',
    desc: 'Uploaded May 9, 2025 · 12 likes'
  },
  {
    id: '2guys',
    title: '2 Guys 1 Phone',
    file: 'videos/2 Guys 1 Phone.mp4',
    poster: 'resources/2 Guys 1 Phone.png',
    desc: 'Uploaded June 18, 2025 · 15 likes'
  }
];

const app = document.getElementById('app');
const content = document.getElementById('content');
const templates = {
  home: document.getElementById('home-view'),
  player: document.getElementById('player-view'),
  about: document.getElementById('about-view')
};

function render(view, data){
  const node = templates[view].content.cloneNode(true);
  // Use document transitions when available
  const run = () => {
    content.innerHTML = '';
    content.appendChild(node);
    if(view === 'home') setupHome();
    if(view === 'player') setupPlayer(data);
  };

  if (document.startViewTransition) {
    document.startViewTransition(run);
  } else {
    run();
  }
}

function setupHome(){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  videos.forEach(v => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = '#video=' + encodeURIComponent(v.id);

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = v.poster;
    img.alt = v.title;
  // identify the thumbnail with the video id so we can match it on back navigation
  img.dataset.videoId = v.id;
  // set a view-transition name so browsers that support the View Transitions API
  // can perform a shared-element transition between the thumbnail and the player
  try { img.style.setProperty('view-transition-name', `video-${v.id}`); } catch(e){}

    const info = document.createElement('div');
    info.className = 'info';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = v.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = v.desc;

    info.appendChild(title);
    info.appendChild(meta);
    a.appendChild(img);
    a.appendChild(info);
    grid.appendChild(a);
  });
}

function setupPlayer(id){
  const v = videos.find(x => x.id === id);
  if(!v){ render('home'); return; }
  const player = document.getElementById('player');
  const title = document.getElementById('title');
  const desc = document.getElementById('description');
  player.src = v.file;
  player.poster = v.poster;
  // assign same view-transition name on the player video so it pairs with the thumb
  try { player.style.setProperty('view-transition-name', `video-${id}`); } catch(e){}
  title.textContent = v.title;
  desc.textContent = v.desc;

  const backBtn = document.querySelector('.back');
  // back should set the thumbnail's transition name before navigating home so
  // the transition can run in reverse
  backBtn.addEventListener('click', ()=>{
    const thumb = document.querySelector(`img[data-video-id="${id}"]`);
    if(thumb){
      try { thumb.style.setProperty('view-transition-name', `video-${id}`); } catch(e){}
    }
    history.pushState({}, '', '/');
    navigate('home');
  });
}

function navigate(view, data){
  // mark active nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  render(view, data);
}

// wire navigation clicks
document.querySelectorAll('.nav-item').forEach(n => {
  n.addEventListener('click', ()=> {
    navigate(n.dataset.view);
    history.pushState({view:n.dataset.view}, '', n.dataset.view === 'home' ? '/' : '#'+n.dataset.view);
  });
});

// search
const search = document.getElementById('search');
search.addEventListener('input', ()=> {
  const q = search.value.toLowerCase().trim();
  const grid = document.getElementById('grid');
  if(!grid) return;
  grid.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('.title').textContent.toLowerCase();
    card.style.display = title.includes(q) ? '' : 'none';
  });
});

// router
function router(){
  const hash = location.hash.slice(1);
  if(hash.startsWith('video=')){
    const id = decodeURIComponent(hash.split('=')[1]);
    navigate('player', id);
  } else if(hash === 'about'){
    navigate('about');
  } else {
    navigate('home');
  }
}

window.addEventListener('popstate', router);
window.addEventListener('hashchange', router);

// initial render
router();

// make clicking cards use SPA navigation
document.addEventListener('click', (e)=>{
  const a = e.target.closest('a.card');
  if(a){
    e.preventDefault();
    const href = a.getAttribute('href') || '';
    if(href.startsWith('#video=')){
      const id = decodeURIComponent(href.split('=')[1]);
      // prepare the thumbnail for a shared-element transition
      const thumb = a.querySelector('img.thumb');
      if(thumb){
        try { thumb.style.setProperty('view-transition-name', `video-${id}`); } catch(e){}
      }
      history.pushState({}, '', '#' + href.slice(1));
      navigate('player', id);
    }
  }
});
