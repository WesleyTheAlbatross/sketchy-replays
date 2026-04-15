const API_BASE = 'https://f1api.dev/api';

const CIRCUIT_STREAM_URLS = {
  'bahrain': 'https://embedsports.top/embed/echo/race-bahrain-international-circuit-3051-kms-formula-1-2526/1',
  'jeddah': 'https://embedsports.top/embed/echo/race-jeddah-corner-circuit-5412-kms-formula-1-2526/1',
  'shanghai': 'https://embedsports.top/embed/echo/race-shanghai-international-circuit-3051-kms-formula-1-2526/1',
  'suzuka': 'https://embedsports.top/embed/echo/race-suzuka-international-racing-course-3051-kms-formula-1-2526/1',
  'miami': 'https://embedsports.top/embed/echo/race-miami-international-autodrome-3051-kms-formula-1-2526/1',
  'monaco': 'https://embedsports.top/embed/echo/race-circuit-de-monaco-3051-kms-formula-1-2526/1',
  'barcelona': 'https://embedsports.top/embed/echo/race-circuit-de-barcelona-catalunya-3051-kms-formula-1-2526/1',
  'montreal': 'https://embedsports.top/embed/echo/race-circuit-gilles-villeneuve-3051-kms-formula-1-2526/1',
  'silverstone': 'https://embedsports.top/embed/echo/race-silverstone-circuit-3051-kms-formula-1-2526/1',
  'hungaroring': 'https://embedsports.top/embed/echo/race-hungaroring-3051-kms-formula-1-2526/1',
  'spa': 'https://embedsports.top/embed/echo/race-circuit-de-spa-franchorchamps-3051-kms-formula-1-2526/1',
  'zandvoort': 'https://embedsports.top/embed/echo/race-circuit-zandvoort-3051-kms-formula-1-2526/1',
  'monza': 'https://embedsports.top/embed/echo/race-monza-national-circuit-3051-kms-formula-1-2526/1',
  'baku': 'https://embedsports.top/embed/echo/race-baku-city-circuit-3051-kms-formula-1-2526/1',
  'singapore': 'https://embedsports.top/embed/echo/race-marina-bay-street-circuit-3051-kms-formula-1-2526/1',
  'las vegas': 'https://embedsports.top/embed/echo/race-las-vegas-street-circuit-3051-kms-formula-1-2526/1',
  'losail': 'https://embedsports.top/embed/echo/race-losail-international-circuit-3051-kms-formula-1-2526/1',
  'interlagos': 'https://embedsports.top/embed/echo/race-interlagos-circuit-3051-kms-formula-1-2526/1',
  'mexico': 'https://embedsports.top/embed/echo/race-rodriguez-family-circuit-3051-kms-formula-1-2526/1',
  'abu dhabi': 'https://embedsports.top/embed/echo/race-yas-marina-circuit-3051-kms-formula-1-2526/1'
};

async function fetchNextRace() {
  try {
    const response = await fetch(`${API_BASE}/current/next`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching next race:', error);
    return null;
  }
}

function getStreamUrl(race) {
  const raceName = (race.raceName || '').toLowerCase();
  const circuit = (race.circuit?.circuitName || '').toLowerCase();
  
  for (const [key, url] of Object.entries(CIRCUIT_STREAM_URLS)) {
    if (raceName.includes(key) || circuit.includes(key)) {
      return url;
    }
  }
  
  return 'https://embedsports.top/embed/echo/race-shanghai-international-circuit-3051-kms-formula-1-2526/1';
}

async function updateLivePage() {
  const raceInfo = document.getElementById('race-info');
  const streamInfo = document.getElementById('stream-info');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  if (!raceInfo) return;
  
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  
  const race = await fetchNextRace();
  
  const lastUpdateEl = document.getElementById('last-update');
  if (lastUpdateEl) {
    lastUpdateEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  }
  
  if (race && race.races && race.races.length > 0) {
    const nextRace = race.races[0];
    const raceDate = new Date(nextRace.schedule.race.date + ' ' + nextRace.schedule.race.time);
    const now = new Date();
    const raceEndTime = new Date(raceDate.getTime() + 3 * 60 * 60 * 1000);
    const isLive = now >= raceDate && now <= raceEndTime;
    const isUpcoming = now < raceDate;
    
    raceInfo.innerHTML = `
      <div class="next-race-card">
        <h2>${nextRace.raceName}</h2>
        <p class="race-details">
          <strong>Round ${nextRace.round}</strong> • ${nextRace.circuit ? nextRace.circuit.circuitName : 'TBD'}
        </p>
        <p class="race-date">
          ${raceDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
          at ${raceDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC
        </p>
        ${isLive ? '<span class="live-badge">LIVE NOW</span>' : ''}
      </div>
    `;
    
    if (streamInfo) {
      const streamUrl = getStreamUrl(nextRace);
      
      let streamStatus = '';
      if (isLive) {
        streamStatus = '<span class="live-badge">LIVE</span>';
      } else if (isUpcoming) {
        const hoursUntil = Math.round((raceDate - now) / (1000 * 60 * 60));
        if (hoursUntil < 24) {
          streamStatus = `<span class="upcoming-badge">Starts in ${hoursUntil} hours</span>`;
        } else {
          const daysUntil = Math.round((raceDate - now) / (1000 * 60 * 60 * 24));
          streamStatus = `<span class="upcoming-badge">Starts in ${daysUntil} day${daysUntil > 1 ? 's' : ''}</span>`;
        }
      }
      
      streamInfo.innerHTML = `
        <div class="race-card">
          <span class="race-title">${nextRace.raceName} ${streamStatus}</span>
          <div class="video-wrapper">
            <iframe 
              src="${streamUrl}"
              allow="fullscreen"
              allowfullscreen>
            </iframe>
          </div>
        </div>
        <div class="card" style="margin-top: 1rem;">
          <h3>Alternative Streams</h3>
          <p>If the above doesn't work, try these:</p>
          <ul class="link-list">
            <li><a href="https://auvio.rtbf.be/emission/formule-1-6111" target="_blank">RTBF Auvio (Belgium)</a> - Free, may need VPN</li>
            <li><a href="https://www.srf.ch/play/tv" target="_blank">SRF (Switzerland)</a> - Free German</li>
            <li><a href="https://servus.com/f1" target="_blank">Servus TV (Austria)</a> - Free German</li>
          </ul>
        </div>
      `;
    }
  } else {
    raceInfo.innerHTML = '<p>No upcoming races found. Season may have ended.</p>';
    if (streamInfo) {
      streamInfo.innerHTML = `
        <div class="card">
          <h3>No Live Race</h3>
          <p>There's no F1 race scheduled at the moment. Check back during race weekends!</p>
        </div>
      `;
    }
  }
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('race-info')) {
    updateLivePage();
    setInterval(() => {
      updateLivePage();
    }, 5 * 60 * 1000);
  }
});