import { useState, useEffect, useRef } from 'react';

// ─── RANKS ───────────────────────────────────────────────────────────────────
const RANKS = [
  { title: 'Script Kiddie',  minXp: 0,    icon: '👾', color: '#4a5568',  bg: 'rgba(74,85,104,0.15)'  },
  { title: 'Threat Hunter',  minXp: 100,  icon: '🔍', color: '#30d158',  bg: 'rgba(48,209,88,0.12)'  },
  { title: 'SOC Analyst',    minXp: 300,  icon: '🛡️', color: '#00c8ff',  bg: 'rgba(0,200,255,0.12)'  },
  { title: 'Pen Tester',     minXp: 600,  icon: '💻', color: '#7b2dff',  bg: 'rgba(123,45,255,0.12)' },
  { title: 'Red Team Lead',  minXp: 1000, icon: '⚔️', color: '#ff6b35',  bg: 'rgba(255,107,53,0.12)' },
  { title: 'CISO',           minXp: 1500, icon: '👑', color: '#ffd60a',  bg: 'rgba(255,214,10,0.12)' },
];

const getRank    = (xp) => [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
const getNextRank= (xp) => RANKS.find(r => r.minXp > xp) || null;

// ─── QUIZ BANK ────────────────────────────────────────────────────────────────
const QUIZ_BANK = {
  DDoS: [
    { q: 'A website crashes after receiving millions of simultaneous requests from thousands of different IPs. What type of attack is this?', options: ['SQL Injection', 'DDoS Attack', 'Ransomware', 'Phishing'], answer: 1, difficulty: 'easy', xp: 10 },
    { q: 'The 2016 Mirai botnet DDoS attack primarily used which type of compromised devices?', options: ['Laptops and desktops', 'Web servers', 'IoT devices like cameras and routers', 'Mobile phones'], answer: 2, difficulty: 'medium', xp: 15 },
    { q: 'Which MITRE ATT&CK technique ID covers volumetric network flooding attacks?', options: ['T1566', 'T1486', 'T1498', 'T1190'], answer: 2, difficulty: 'hard', xp: 25 },
    { q: 'What does BGP Blackhole Routing do in the context of DDoS defence?', options: ['Encrypts traffic', 'Routes attack traffic to a null interface at the ISP level', 'Blocks all port 80 traffic', 'Resets TCP connections'], answer: 1, difficulty: 'hard', xp: 25 },
  ],
  Malware: [
    { q: 'A user opens an email attachment and their computer silently starts sending data to an overseas server. What most likely happened?', options: ['DDoS attack', 'SQL Injection', 'Malware infection', 'Port scanning'], answer: 2, difficulty: 'easy', xp: 10 },
    { q: 'NotPetya (2017) was disguised as ransomware. What was it actually designed to do?', options: ['Steal credit card data', 'Mine cryptocurrency', 'Permanently destroy data (wiper)', 'Create a botnet'], answer: 2, difficulty: 'medium', xp: 15 },
    { q: 'How does malware typically survive a system reboot?', options: ['It hides in RAM', 'Registry run keys and scheduled tasks', 'It infects the BIOS firmware only', 'It uses DNS to restore itself'], answer: 1, difficulty: 'medium', xp: 15 },
    { q: 'Which MITRE ATT&CK sub-technique describes malware delivered via malicious Office documents?', options: ['T1204.002', 'T1498.001', 'T1566.001', 'T1190'], answer: 0, difficulty: 'hard', xp: 25 },
  ],
  Phishing: [
    { q: 'An employee receives an email from "ceo@c0mpany.com" requesting an urgent wire transfer. What type of attack is this?', options: ['Ransomware deployment', 'Business Email Compromise', 'SQL Injection', 'Credential stuffing'], answer: 1, difficulty: 'easy', xp: 10 },
    { q: 'The MGM Resorts 2023 breach started when attackers did what?', options: ['Exploited an unpatched database', 'Called the IT help desk pretending to be an employee', 'Sent malicious USB drives to staff', 'Used SQL injection on the booking portal'], answer: 1, difficulty: 'medium', xp: 15 },
    { q: 'Which email security standard publishes a policy telling receiving servers what to do with spoofed emails?', options: ['SPF', 'DKIM', 'DMARC', 'TLS'], answer: 2, difficulty: 'medium', xp: 15 },
    { q: 'An AiTM (adversary-in-the-middle) phishing proxy can bypass which authentication method?', options: ['Hardware FIDO2 / passkeys', 'TOTP authenticator app codes', 'Certificate-based auth', 'Biometric login'], answer: 1, difficulty: 'hard', xp: 25 },
  ],
  Ransomware: [
    { q: 'WannaCry (2017) spread across networks rapidly without any user interaction. What made this possible?', options: ['A phishing email campaign', 'The EternalBlue SMB vulnerability', 'A malicious USB drive', 'A compromised software update'], answer: 1, difficulty: 'easy', xp: 10 },
    { q: 'What is "double extortion" in modern ransomware operations?', options: ['Encrypting files twice with two algorithms', 'Attacking two companies at once', 'Stealing data BEFORE encrypting, then threatening to leak it', 'Demanding two separate ransom payments'], answer: 2, difficulty: 'medium', xp: 15 },
    { q: 'The Colonial Pipeline attack (2021) caused what immediate real-world impact?', options: ['US East Coast power outages', 'US East Coast fuel supply disrupted for 6 days', 'Major US bank systems offline', 'Internet outages across 5 states'], answer: 1, difficulty: 'medium', xp: 15 },
    { q: 'What backup storage property makes it most resistant to ransomware deleting your backups?', options: ['Cloud replication', 'Network-attached storage', 'WORM (Write Once Read Many)', 'Encrypted external drives'], answer: 2, difficulty: 'hard', xp: 25 },
  ],
  'Data Breach': [
    { q: 'How many accounts were exposed in the Yahoo breach — making it the largest in history?', options: ['500 million', '1 billion', '2 billion', '3 billion'], answer: 3, difficulty: 'easy', xp: 10 },
    { q: 'Equifax was breached in 2017 via an unpatched vulnerability in which web framework?', options: ['Node.js Express', 'Django', 'Apache Struts', 'Ruby on Rails'], answer: 2, difficulty: 'medium', xp: 15 },
    { q: 'What technique replaces sensitive data like card numbers with non-sensitive substitutes, reducing PCI-DSS scope?', options: ['Encryption', 'Hashing', 'Tokenization', 'Masking'], answer: 2, difficulty: 'hard', xp: 25 },
    { q: 'Under GDPR, organisations must notify regulators of a personal data breach within how many hours?', options: ['24 hours', '48 hours', '72 hours', '7 days'], answer: 2, difficulty: 'medium', xp: 15 },
  ],
  'SQL Injection': [
    { q: "A hacker types ' OR 1=1-- into a login form and gains admin access. What attack is this?", options: ['Cross-Site Scripting', 'CSRF', 'SQL Injection', 'Command Injection'], answer: 2, difficulty: 'easy', xp: 10 },
    { q: 'The MOVEit Transfer breach (2023) affecting 62 million people was exploited by which group?', options: ['LockBit', 'Cl0p', 'REvil', 'DarkSide'], answer: 1, difficulty: 'medium', xp: 15 },
    { q: 'What is the single most effective defence against SQL injection attacks?', options: ['Web Application Firewall', 'Input length validation', 'Parameterised queries / prepared statements', 'HTTPS encryption'], answer: 2, difficulty: 'easy', xp: 10 },
    { q: 'Which SQLi technique infers data by asking the database true/false questions with no visible output?', options: ['Union-based injection', 'Error-based injection', 'Blind boolean-based injection', 'Out-of-band injection'], answer: 2, difficulty: 'hard', xp: 25 },
  ],
};

// ─── DAILY CHALLENGES ────────────────────────────────────────────────────────
const DAILY_CHALLENGES = [
  {
    attackType: 'Ransomware', icon: '🔒',
    title: 'RANSOMWARE OUTBREAK',
    scenario: "It's 2am. Your monitoring alerts fire — encrypted files with .locked extensions are spreading across your file servers. IT confirms active ransomware. Pick every correct immediate response action.",
    steps: [
      { action: 'Immediately isolate all infected machines from the network', correct: true,  xp: 20 },
      { action: 'Pay the ransom quickly to minimise downtime and get keys faster', correct: false, xp: 0 },
      { action: 'Restore critical systems from the last known-clean offline backup', correct: true,  xp: 20 },
      { action: 'Contact law enforcement and preserve all forensic evidence', correct: true,  xp: 15 },
      { action: 'Keep working on infected machines — the encryption might stop on its own', correct: false, xp: 0 },
      { action: 'Disable backup systems to prevent them being encrypted too', correct: false, xp: 0 },
      { action: 'Notify affected stakeholders and begin your incident response plan', correct: true,  xp: 15 },
    ],
    explanation: 'Network isolation stops lateral spread immediately. Clean backups restore operations without paying criminals. Law enforcement may have decryption keys for known ransomware strains and paying ransoms funds future attacks.',
  },
  {
    attackType: 'Phishing', icon: '🎣',
    title: 'SPOT THE PHISH',
    scenario: 'You receive an urgent email: "IT-Support@c0mpany-helpdesk.net — Your password expires in 1 hour. Click here to reset immediately or lose access." Identify ALL the red flags.',
    steps: [
      { action: "The sender domain is not your company's actual domain", correct: true,  xp: 20 },
      { action: 'The artificial urgency ("1 hour") is a classic pressure tactic', correct: true,  xp: 15 },
      { action: 'Legitimate IT teams never request passwords via email links', correct: true,  xp: 20 },
      { action: 'The email uses correct grammar so it must be legitimate', correct: false, xp: 0 },
      { action: 'You should click the link to verify whether it is real or fake', correct: false, xp: 0 },
      { action: 'You should report it to your security team without clicking', correct: true,  xp: 15 },
    ],
    explanation: 'Always verify sender domains character-by-character — attackers use lookalikes like c0mpany vs company. Urgency + credential requests + unknown domains = the holy trinity of phishing. Never click to verify.',
  },
  {
    attackType: 'DDoS', icon: '🌊',
    title: 'UNDER THE FLOOD',
    scenario: "Your e-commerce site is receiving 50 million HTTP requests per second from 20,000 unique IPs. The site is down. Revenue is $10,000 per minute. Pick the RIGHT immediate actions.",
    steps: [
      { action: 'Activate CDN DDoS protection and traffic scrubbing immediately', correct: true,  xp: 20 },
      { action: 'Permanently block all international IP ranges', correct: false, xp: 0 },
      { action: 'Implement per-IP rate limiting at your edge servers', correct: true,  xp: 15 },
      { action: 'Contact your upstream ISP to apply BGP blackholing', correct: true,  xp: 20 },
      { action: 'Restart the web servers to reset all connections', correct: false, xp: 0 },
      { action: 'Activate your incident response plan and notify stakeholders', correct: true,  xp: 15 },
    ],
    explanation: 'Traffic scrubbing + per-IP rate limiting + upstream BGP blackholing is the layered DDoS response. Restarting servers does nothing against volumetric attacks. Blocking all international traffic kills legitimate customers.',
  },
  {
    attackType: 'SQL Injection', icon: '💉',
    title: 'DATABASE UNDER ATTACK',
    scenario: "A penetration tester just reported your login form is vulnerable to SQL injection using ' OR 1=1--. Your site is live with 50,000 active users. What do you do right now?",
    steps: [
      { action: 'Replace all string concatenation with parameterised queries immediately', correct: true,  xp: 25 },
      { action: 'Add input length limits — this alone will stop SQL injection', correct: false, xp: 0 },
      { action: 'Deploy a WAF with SQL injection rules as an emergency stopgap', correct: true,  xp: 15 },
      { action: 'Rename your database tables to confuse potential attackers', correct: false, xp: 0 },
      { action: 'Audit every other form and API endpoint for the same vulnerability', correct: true,  xp: 20 },
      { action: 'Apply least-privilege to the database account used by the application', correct: true,  xp: 15 },
    ],
    explanation: 'Parameterised queries are the ONLY real fix — WAF is a band-aid that buys time. Length limits do not stop SQLi. Least-privilege limits the blast radius if exploitation still occurs. Audit everything, not just the reported form.',
  },
  {
    attackType: 'Data Breach', icon: '🗄️',
    title: 'BREACH DETECTED',
    scenario: "Your SIEM alerts that 2GB of customer PII including SSNs and card numbers was exfiltrated to an external IP at 3am. The data belongs to 80,000 customers. What do you do?",
    steps: [
      { action: 'Immediately revoke the compromised credentials that were used', correct: true,  xp: 20 },
      { action: 'Notify affected customers privately without involving regulators to protect reputation', correct: false, xp: 0 },
      { action: 'Preserve all logs and forensic evidence before making any changes', correct: true,  xp: 20 },
      { action: 'Notify relevant regulators within required legal timeframes (GDPR: 72 hours)', correct: true,  xp: 20 },
      { action: 'Delete the access logs to prevent further legal liability', correct: false, xp: 0 },
      { action: 'Engage a specialist forensics firm to determine the full scope', correct: true,  xp: 15 },
    ],
    explanation: 'Evidence preservation is critical — logs are your only reconstruction of what happened. GDPR mandates 72-hour regulator notification. Deleting logs is obstruction of justice. Regulators treat notification delays as an aggravating factor.',
  },
  {
    attackType: 'Malware', icon: '🦠',
    title: 'CFO COMPROMISED',
    scenario: "Your EDR fires — a process is injecting into explorer.exe on your CFO's laptop and beaconing to an unknown IP every 30 seconds. The CFO has access to all financial systems. What do you do?",
    steps: [
      { action: 'Immediately isolate the CFO laptop from the network via EDR', correct: true,  xp: 20 },
      { action: "Ask the CFO to close the suspicious window and restart their laptop", correct: false, xp: 0 },
      { action: 'Collect a full memory dump before killing any processes', correct: true,  xp: 20 },
      { action: 'Block the C2 IP address at the perimeter firewall', correct: true,  xp: 15 },
      { action: "Reset all the CFO's credentials from a known-clean separate device", correct: true,  xp: 15 },
      { action: 'Wait 24 hours to gather more data before taking any action', correct: false, xp: 0 },
    ],
    explanation: 'Isolation immediately breaks the C2 channel. Memory dumps capture the live malware payload before it cleans up. Credential reset from a clean device prevents the attacker from using stolen session tokens for lateral movement.',
  },
];

const getDailyChallenge = () => {
  const idx = Math.floor(Date.now() / 86400000) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[idx];
};

const ATTACK_ICONS = { DDoS:'🌊', Malware:'🦠', Phishing:'🎣', Ransomware:'🔒', 'Data Breach':'🗄️', 'SQL Injection':'💉' };
const DIFF_COLORS  = { easy:'#30d158', medium:'#ffd60a', hard:'#ff2d55' };
const todayKey     = () => new Date().toISOString().split('T')[0];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GamificationPanel({ currentAttackType, onClose }) {
  const [tab,        setTab       ] = useState('hub');   // hub | quiz | challenge
  const [xp,         setXp        ] = useState(0);
  const [streak,     setStreak    ] = useState(0);
  const [lastVisit,  setLastVisit ] = useState('');
  const [history,    setHistory   ] = useState([]);      // { correct, xp, type }
  const [doneToday,  setDoneToday ] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  // Quiz state
  const [quizType,    setQuizType   ] = useState(null);
  const [qIndex,      setQIndex     ] = useState(0);
  const [picked,      setPicked     ] = useState(null);
  const [answered,    setAnswered   ] = useState(false);
  const [sessionXp,   setSessionXp  ] = useState(0);
  const [quizDone,    setQuizDone   ] = useState(false);

  // Challenge state
  const [chosen,      setChosen     ] = useState(new Set());
  const [submitted,   setSubmitted  ] = useState(false);
  const [chalScore,   setChalScore  ] = useState(0);

  // Toast
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const challenge = getDailyChallenge();

  // ── Persist / load ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('bm_gami') || '{}');
      if (d.xp      != null) setXp(d.xp);
      if (d.streak  != null) setStreak(d.streak);
      if (d.lastVisit)       setLastVisit(d.lastVisit);
      if (d.history)         setHistory(d.history);
      if (d.doneToday === todayKey()) { setDoneToday(true); setTodayScore(d.todayScore || 0); }
    } catch {}
  }, []);

  const save = (patch) => {
    try {
      const cur = JSON.parse(localStorage.getItem('bm_gami') || '{}');
      localStorage.setItem('bm_gami', JSON.stringify({ ...cur, ...patch }));
    } catch {}
  };

  // ── Streak logic ────────────────────────────────────────────────────────
  useEffect(() => {
    const today = todayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastVisit === today) return;
    let newStreak = streak;
    if (lastVisit === yesterday) {
      newStreak = streak + 1;
      const bonus = Math.min(newStreak * 5, 50);
      addXp(bonus, `🔥 ${newStreak}-day streak! +${bonus} XP`);
      setStreak(newStreak);
    } else if (!lastVisit) {
      newStreak = 1; setStreak(1);
    } else {
      newStreak = 1; setStreak(1);
    }
    setLastVisit(today);
    save({ lastVisit: today, streak: newStreak });
  }, []);

  // ── XP helper ───────────────────────────────────────────────────────────
  const addXp = (amount, msg) => {
    setXp(p => { const n = p + amount; save({ xp: n }); return n; });
    if (msg) showToast(msg, '#ffd60a');
  };

  const showToast = (msg, color = '#00c8ff') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, color });
    toastRef.current = setTimeout(() => setToast(null), 2800);
  };

  // ── Quiz helpers ────────────────────────────────────────────────────────
  const startQuiz = (type) => {
    setQuizType(type); setQIndex(0); setPicked(null);
    setAnswered(false); setSessionXp(0); setQuizDone(false); setTab('quiz');
  };

  const handlePick = (idx) => {
    if (answered) return;
    const q = QUIZ_BANK[quizType][qIndex];
    const ok = idx === q.answer;
    setPicked(idx); setAnswered(true);
    const earned = ok ? q.xp : 0;
    if (ok) { addXp(earned, null); setSessionXp(p => p + earned); }
    const entry = { correct: ok, xp: earned, type: quizType };
    setHistory(p => { const n = [...p, entry]; save({ history: n }); return n; });
    setTimeout(() => {
      const qs = QUIZ_BANK[quizType];
      if (qIndex < qs.length - 1) { setQIndex(i => i + 1); setPicked(null); setAnswered(false); }
      else setQuizDone(true);
    }, 1100);
  };

  // ── Challenge helpers ───────────────────────────────────────────────────
  const toggleStep = (i) => {
    if (submitted) return;
    setChosen(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const submitChallenge = () => {
    let earned = 0;
    challenge.steps.forEach((s, i) => { if (chosen.has(i) && s.correct) earned += s.xp; });
    const wrong = [...chosen].filter(i => !challenge.steps[i].correct).length;
    const net   = Math.max(0, earned - wrong * 8);
    setChalScore(net); setSubmitted(true);
    addXp(net, `⚔️ Challenge complete! +${net} XP`);
    setDoneToday(true); setTodayScore(net);
    save({ doneToday: todayKey(), todayScore: net });
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const rank     = getRank(xp);
  const nextRank = getNextRank(xp);
  const pct      = nextRank ? Math.round(((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100) : 100;
  const accuracy = history.length ? Math.round((history.filter(h => h.correct).length / history.length) * 100) : 0;
  const qs       = quizType ? QUIZ_BANK[quizType] : [];
  const curQ     = qs[qIndex];

  return (
    <div style={{
      position: 'fixed', right: 0, top: '68px', bottom: 0, width: '440px',
      background: 'rgba(5,6,18,0.99)', backdropFilter: 'blur(24px)',
      borderLeft: '1px solid rgba(0,200,255,0.12)',
      display: 'flex', flexDirection: 'column',
      zIndex: 95, animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',
      fontFamily: "'Share Tech Mono', monospace",
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)',
          padding: '8px 20px', background: 'rgba(5,6,18,0.96)',
          border: `1px solid ${toast.color}66`, borderRadius: '20px',
          color: toast.color, fontSize: '12px', fontFamily: 'Orbitron', fontWeight: 700,
          letterSpacing: '1px', zIndex: 300, whiteSpace: 'nowrap',
          animation: 'toastPop 0.3s ease', boxShadow: `0 0 24px ${toast.color}44`,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── TOP PROFILE BAR ── */}
      <div style={{ padding: '18px 20px 0', borderBottom: '1px solid rgba(0,200,255,0.1)', flexShrink: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {/* Rank + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: rank.bg, border: `1px solid ${rank.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', boxShadow: `0 0 16px ${rank.color}33`,
            }}>{rank.icon}</div>
            <div>
              <div style={{ fontFamily: 'Orbitron', fontSize: '15px', color: rank.color, fontWeight: 900, letterSpacing: '1.5px' }}>{rank.title}</div>
              <div style={{ color: '#4a5568', fontSize: '9px', marginTop: '1px', letterSpacing: '1px' }}>THREAT ANALYST</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', background: 'rgba(255,45,85,0.12)',
            border: '1px solid rgba(255,45,85,0.35)', borderRadius: '50%',
            color: '#ff2d55', fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff2d55'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.12)'; e.currentTarget.style.color = '#ff2d55'; }}>✕</button>
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#ffd60a', fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 900 }}>{xp.toLocaleString()} <span style={{ fontSize: '10px', color: '#4a5568' }}>XP</span></span>
            {nextRank && <span style={{ color: '#4a5568', fontSize: '10px', alignSelf: 'flex-end' }}>→ {nextRank.icon} {nextRank.title} ({nextRank.minXp - xp} XP)</span>}
          </div>
          <div style={{ height: '5px', background: 'rgba(255,214,10,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#ffd60a,#ff6b35)', borderRadius: '3px', boxShadow: '0 0 10px rgba(255,214,10,0.4)', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '7px', marginBottom: '14px' }}>
          <QStat label="Streak" value={`${streak}🔥`}  color="#ff6b35" />
          <QStat label="XP"     value={xp}             color="#ffd60a" />
          <QStat label="Accuracy" value={`${accuracy}%`} color="#00c8ff" />
          <QStat label="Quizzes" value={history.length} color="#7b2dff" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: 'none' }}>
          {[{id:'hub',label:'🏠 HUB'},{id:'quiz',label:'🧠 QUIZ'},{id:'challenge',label:'⚔️ DAILY'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '9px 6px',
              background: tab === t.id ? 'rgba(0,200,255,0.07)' : 'transparent',
              border: 'none', borderBottom: tab === t.id ? '2px solid #00c8ff' : '2px solid transparent',
              color: tab === t.id ? '#00c8ff' : '#4a5568',
              fontSize: '10px', fontFamily: "'Share Tech Mono',monospace",
              cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

        {/* ══════════════ HUB ══════════════ */}
        {tab === 'hub' && (
          <div>
            {/* Rank ladder */}
            <PanelLabel>RANK PROGRESSION</PanelLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '22px' }}>
              {RANKS.map(r => {
                const unlocked = xp >= r.minXp;
                const isCurrent = rank.title === r.title;
                return (
                  <div key={r.title} style={{
                    padding: '12px 10px', borderRadius: '10px', textAlign: 'center',
                    background: isCurrent ? r.bg : unlocked ? 'rgba(0,200,255,0.03)' : 'rgba(0,0,0,0.15)',
                    border: `1px solid ${isCurrent ? r.color + '55' : unlocked ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                    opacity: unlocked ? 1 : 0.4, transition: 'all 0.3s', position: 'relative',
                  }}>
                    {isCurrent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${r.color},transparent)`, borderRadius: '10px 10px 0 0' }} />}
                    <div style={{ fontSize: '20px', marginBottom: '5px' }}>{r.icon}</div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '9px', color: isCurrent ? r.color : unlocked ? '#718096' : '#2d3748', fontWeight: 700, letterSpacing: '0.5px' }}>{r.title}</div>
                    <div style={{ color: '#4a5568', fontSize: '8px', marginTop: '3px' }}>{r.minXp} XP</div>
                    {isCurrent && <div style={{ marginTop: '5px', padding: '2px 6px', background: `${r.color}22`, border: `1px solid ${r.color}44`, borderRadius: '8px', fontSize: '8px', color: r.color, fontFamily: 'Orbitron' }}>YOU</div>}
                    {!unlocked && <div style={{ marginTop: '5px', fontSize: '10px' }}>🔒</div>}
                  </div>
                );
              })}
            </div>

            {/* Pick a quiz */}
            <PanelLabel>PICK A QUIZ TOPIC</PanelLabel>
            <p style={{ color: '#4a5568', fontSize: '11px', marginBottom: '14px', lineHeight: 1.7 }}>
              Each topic has 4 questions at mixed difficulty levels. Correct answers earn XP — harder questions earn more.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', marginBottom: '22px' }}>
              {Object.keys(QUIZ_BANK).map(type => {
                const isLive = type === currentAttackType;
                return (
                  <button key={type} onClick={() => startQuiz(type)} style={{
                    padding: '13px 11px', borderRadius: '10px', textAlign: 'left',
                    background: isLive ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.04)',
                    border: `1px solid ${isLive ? 'rgba(0,200,255,0.45)' : 'rgba(0,200,255,0.12)'}`,
                    color: '#a0aec0', cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: "'Share Tech Mono',monospace", fontSize: '11px',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.4)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isLive ? 'rgba(0,200,255,0.1)' : 'rgba(0,200,255,0.04)'; e.currentTarget.style.borderColor = isLive ? 'rgba(0,200,255,0.45)' : 'rgba(0,200,255,0.12)'; e.currentTarget.style.color = '#a0aec0'; }}>
                    <div style={{ fontSize: '18px', marginBottom: '5px' }}>{ATTACK_ICONS[type]}</div>
                    <div style={{ marginBottom: '3px', color: isLive ? '#00c8ff' : '#a0aec0' }}>{type}</div>
                    <div style={{ fontSize: '9px', color: '#4a5568' }}>{QUIZ_BANK[type].length} questions</div>
                    {isLive && <div style={{ marginTop: '5px', fontSize: '9px', color: '#00c8ff', fontFamily: 'Orbitron', letterSpacing: '1px' }}>⚡ LIVE NOW</div>}
                  </button>
                );
              })}
            </div>

            {/* Recent history */}
            <PanelLabel>RECENT QUIZ HISTORY</PanelLabel>
            {history.length === 0 ? (
              <div style={{ color: '#4a5568', fontSize: '11px', textAlign: 'center', padding: '20px 0', border: '1px dashed rgba(0,200,255,0.1)', borderRadius: '10px' }}>
                No history yet — take your first quiz above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {[...history].reverse().slice(0, 10).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(0,200,255,0.02)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px' }}>{h.correct ? '✅' : '❌'}</span>
                    <span style={{ color: '#718096', fontSize: '10px', flex: 1 }}>{ATTACK_ICONS[h.type]} {h.type}</span>
                    <span style={{ color: h.correct ? '#ffd60a' : '#4a5568', fontFamily: 'Orbitron', fontSize: '10px' }}>{h.correct ? `+${h.xp} XP` : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ QUIZ ══════════════ */}
        {tab === 'quiz' && !quizType && (
          <div>
            <PanelLabel>SELECT QUIZ TOPIC</PanelLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
              {Object.keys(QUIZ_BANK).map(type => (
                <button key={type} onClick={() => startQuiz(type)} style={{
                  padding: '18px 14px', borderRadius: '12px', textAlign: 'center',
                  background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)',
                  color: '#a0aec0', cursor: 'pointer', transition: 'all 0.2s',
                  fontFamily: "'Share Tech Mono',monospace", fontSize: '12px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.12)'; e.currentTarget.style.color = '#00c8ff'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.04)'; e.currentTarget.style.color = '#a0aec0'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>{ATTACK_ICONS[type]}</div>
                  <div>{type}</div>
                  <div style={{ color: '#4a5568', fontSize: '10px', marginTop: '5px' }}>{QUIZ_BANK[type].length} questions · Mixed XP</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'quiz' && quizType && !quizDone && curQ && (
          <div>
            {/* Progress bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#4a5568', fontSize: '10px', fontFamily: 'Orbitron' }}>
                {ATTACK_ICONS[quizType]} {quizType} — Q{qIndex + 1}/{qs.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: DIFF_COLORS[curQ.difficulty], fontSize: '9px', fontFamily: 'Orbitron', textTransform: 'uppercase', padding: '2px 8px', border: `1px solid ${DIFF_COLORS[curQ.difficulty]}44`, borderRadius: '10px', background: `${DIFF_COLORS[curQ.difficulty]}12` }}>{curQ.difficulty}</span>
                <span style={{ color: '#ffd60a', fontFamily: 'Orbitron', fontSize: '10px' }}>+{curQ.xp} XP</span>
              </div>
            </div>
            <div style={{ height: '3px', background: 'rgba(0,200,255,0.08)', borderRadius: '2px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((qIndex + 1) / qs.length) * 100}%`, background: 'linear-gradient(90deg,#00c8ff,#7b2dff)', transition: 'width 0.4s ease' }} />
            </div>

            {/* Question */}
            <div style={{ padding: '16px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.15)', borderRadius: '10px', marginBottom: '16px' }}>
              <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: 1.85, margin: 0 }}>{curQ.q}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {curQ.options.map((opt, i) => {
                let bg = 'rgba(0,200,255,0.03)', bdr = '1px solid rgba(0,200,255,0.12)', col = '#a0aec0', icon = null;
                if (answered) {
                  if (i === curQ.answer)                        { bg='rgba(48,209,88,0.12)'; bdr='1px solid rgba(48,209,88,0.5)'; col='#30d158'; icon='✅'; }
                  else if (i === picked && i !== curQ.answer)  { bg='rgba(255,45,85,0.12)'; bdr='1px solid rgba(255,45,85,0.5)'; col='#ff2d55'; icon='❌'; }
                  else                                          { col='#4a5568'; }
                }
                return (
                  <button key={i} onClick={() => handlePick(i)} disabled={answered} style={{
                    padding: '12px 14px', background: bg, border: bdr, borderRadius: '8px',
                    color: col, fontSize: '12px', cursor: answered ? 'default' : 'pointer',
                    transition: 'all 0.25s', textAlign: 'left',
                    fontFamily: "'Share Tech Mono',monospace",
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}
                    onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = 'rgba(0,200,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.4)'; e.currentTarget.style.color = '#00c8ff'; } }}
                    onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = 'rgba(0,200,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.12)'; e.currentTarget.style.color = '#a0aec0'; } }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `1px solid ${col}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0, fontFamily: 'Orbitron', color: col }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {icon && <span style={{ fontSize: '14px', flexShrink: 0 }}>{icon}</span>}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', color: '#4a5568', fontSize: '10px' }}>
              Session XP: <span style={{ color: '#ffd60a', fontFamily: 'Orbitron' }}>{sessionXp}</span>
            </div>
          </div>
        )}

        {/* Quiz results */}
        {tab === 'quiz' && quizDone && (
          <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '14px' }}>
              {sessionXp >= 70 ? '🏆' : sessionXp >= 40 ? '🥈' : sessionXp >= 20 ? '🥉' : '📚'}
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: '18px', color: '#f0f4ff', marginBottom: '6px', letterSpacing: '2px' }}>QUIZ COMPLETE</div>
            <div style={{ color: '#ffd60a', fontFamily: 'Orbitron', fontSize: '36px', fontWeight: 900, marginBottom: '6px', textShadow: '0 0 30px rgba(255,214,10,0.6)' }}>+{sessionXp} XP</div>
            <div style={{ color: '#4a5568', fontSize: '11px', marginBottom: '10px' }}>Total: {xp.toLocaleString()} XP</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: rank.bg, border: `1px solid ${rank.color}44`, borderRadius: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '16px' }}>{rank.icon}</span>
              <span style={{ color: rank.color, fontFamily: 'Orbitron', fontSize: '12px' }}>{rank.title}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => { setQuizType(null); setQuizDone(false); setSessionXp(0); }} style={{ padding: '10px 20px', background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.35)', borderRadius: '8px', color: '#00c8ff', fontSize: '11px', cursor: 'pointer', fontFamily: "'Share Tech Mono',monospace", letterSpacing: '1px' }}>
                NEW QUIZ
              </button>
              <button onClick={() => { setTab('hub'); setQuizType(null); setQuizDone(false); setSessionXp(0); }} style={{ padding: '10px 20px', background: 'rgba(123,45,255,0.08)', border: '1px solid rgba(123,45,255,0.35)', borderRadius: '8px', color: '#7b2dff', fontSize: '11px', cursor: 'pointer', fontFamily: "'Share Tech Mono',monospace", letterSpacing: '1px' }}>
                BACK TO HUB
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ DAILY CHALLENGE ══════════════ */}
        {tab === 'challenge' && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <PanelLabel>DAILY CHALLENGE</PanelLabel>
              <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: '12px', fontSize: '9px', fontFamily: 'Orbitron', letterSpacing: '1px', background: doneToday ? 'rgba(48,209,88,0.12)' : 'rgba(255,214,10,0.1)', border: `1px solid ${doneToday ? 'rgba(48,209,88,0.4)' : 'rgba(255,214,10,0.3)'}`, color: doneToday ? '#30d158' : '#ffd60a', marginBottom: '13px' }}>
                {doneToday ? '✅ DONE TODAY' : '⚡ NEW TODAY'}
              </div>
            </div>

            <p style={{ color: '#4a5568', fontSize: '11px', marginBottom: '14px', lineHeight: 1.7 }}>
              A new incident scenario every day. Select <strong style={{ color: '#e2e8f0' }}>ALL</strong> the correct response actions — wrong selections reduce your XP.
            </p>

            {/* Scenario card */}
            <div style={{ padding: '14px 16px', background: 'rgba(255,214,10,0.04)', border: '1px solid rgba(255,214,10,0.2)', borderRadius: '10px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#ffd60a,transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{challenge.icon}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '11px', color: '#ffd60a', letterSpacing: '1.5px' }}>{challenge.title}</span>
              </div>
              <p style={{ color: '#a0aec0', fontSize: '12px', margin: 0, lineHeight: 1.85 }}>{challenge.scenario}</p>
            </div>

            {/* Steps */}
            <div style={{ fontFamily: 'Orbitron', fontSize: '9px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '10px' }}>
              SELECT ALL CORRECT ACTIONS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
              {challenge.steps.map((step, i) => {
                const sel = chosen.has(i);
                let bg = sel ? 'rgba(0,200,255,0.08)' : 'rgba(0,200,255,0.02)';
                let bdr = sel ? '1px solid rgba(0,200,255,0.4)' : '1px solid rgba(0,200,255,0.1)';
                let col = sel ? '#e2e8f0' : '#718096';
                let ico = sel ? '☑' : '☐';
                if (submitted) {
                  if (sel && step.correct)   { bg='rgba(48,209,88,0.1)';  bdr='1px solid rgba(48,209,88,0.4)';  col='#30d158'; ico='✅'; }
                  else if (sel && !step.correct) { bg='rgba(255,45,85,0.1)'; bdr='1px solid rgba(255,45,85,0.4)'; col='#ff2d55'; ico='❌'; }
                  else if (!sel && step.correct) { bg='rgba(255,107,53,0.07)'; bdr='1px solid rgba(255,107,53,0.3)'; col='#ff6b35'; ico='⚠️'; }
                }
                return (
                  <button key={i} onClick={() => toggleStep(i)} disabled={submitted} style={{
                    padding: '11px 13px', background: bg, border: bdr, borderRadius: '8px',
                    color: col, fontSize: '12px', cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'left',
                    fontFamily: "'Share Tech Mono',monospace",
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <span style={{ flexShrink: 0, fontSize: '14px', lineHeight: 1.4 }}>{ico}</span>
                    <span style={{ flex: 1, lineHeight: 1.65 }}>{step.action}</span>
                    {submitted && sel && step.correct && <span style={{ color: '#30d158', fontFamily: 'Orbitron', fontSize: '9px', flexShrink: 0 }}>+{step.xp}</span>}
                  </button>
                );
              })}
            </div>

            {/* Submit button */}
            {!submitted && !doneToday && (
              <button onClick={submitChallenge} disabled={chosen.size === 0} style={{
                width: '100%', padding: '13px',
                background: chosen.size > 0 ? 'linear-gradient(135deg,rgba(48,209,88,0.12),rgba(0,200,255,0.12))' : 'rgba(0,0,0,0.15)',
                border: `1px solid ${chosen.size > 0 ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: '10px', color: chosen.size > 0 ? '#30d158' : '#4a5568',
                fontSize: '12px', fontFamily: 'Orbitron', letterSpacing: '2px',
                cursor: chosen.size > 0 ? 'pointer' : 'default', transition: 'all 0.25s',
              }}>
                SUBMIT RESPONSE
              </button>
            )}

            {/* Already done today */}
            {doneToday && !submitted && (
              <div style={{ padding: '14px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ color: '#30d158', fontFamily: 'Orbitron', fontSize: '11px', marginBottom: '4px' }}>✅ COMPLETED TODAY</div>
                <div style={{ color: '#4a5568', fontSize: '11px' }}>Score: <span style={{ color: '#ffd60a', fontFamily: 'Orbitron' }}>{todayScore} XP</span> · New challenge tomorrow!</div>
              </div>
            )}

            {/* Results */}
            {submitted && (
              <div>
                <div style={{ padding: '16px', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.25)', borderRadius: '10px', textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ color: '#30d158', fontFamily: 'Orbitron', fontSize: '11px', letterSpacing: '1.5px', marginBottom: '4px' }}>CHALLENGE COMPLETE</div>
                  <div style={{ color: '#ffd60a', fontFamily: 'Orbitron', fontSize: '32px', fontWeight: 900, textShadow: '0 0 24px rgba(255,214,10,0.5)' }}>+{chalScore} XP</div>
                </div>
                <div style={{ padding: '14px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.12)', borderRadius: '10px', marginBottom: '14px' }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: '9px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '8px' }}>💡 EXPLANATION</div>
                  <p style={{ color: '#718096', fontSize: '12px', margin: 0, lineHeight: 1.85 }}>{challenge.explanation}</p>
                </div>
              </div>
            )}

            {/* Streak card */}
            <div style={{ padding: '12px 14px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.18)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🔥</span>
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '9px', color: '#ff6b35', letterSpacing: '1px', marginBottom: '2px' }}>DAILY STREAK</div>
                <div style={{ color: '#e2e8f0', fontSize: '12px', lineHeight: 1.5 }}>
                  <span style={{ color: '#ff6b35', fontFamily: 'Orbitron', fontWeight: 900, fontSize: '20px' }}>{streak}</span> day{streak !== 1 ? 's' : ''} · Visit daily to keep it going!
                </div>
                {streak >= 3 && <div style={{ color: '#4a5568', fontSize: '10px', marginTop: '2px' }}>🎯 Streak bonus: +{Math.min(streak * 5, 50)} XP on next visit</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes toastPop {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function QStat({ label, value, color }) {
  return (
    <div style={{ padding: '8px 6px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '7px', textAlign: 'center' }}>
      <div style={{ color: '#4a5568', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>{label}</div>
      <div style={{ color, fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PanelLabel({ children }) {
  return (
    <div style={{ fontFamily: 'Orbitron', fontSize: '10px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '13px', paddingBottom: '7px', borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
      {children}
    </div>
  );
}
