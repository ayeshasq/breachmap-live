import { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import GamificationPanel from '../components/GamificationPanel';

// ─── KNOWLEDGE BASE ──────────────────────────────────────────────────────────
const ATTACK_DATA = {
  'DDoS': {
    icon: '🌊', fullName: 'Distributed Denial of Service',
    mitre: { tactic:'Impact', tacticId:'TA0040', technique:'Network Denial of Service', techniqueId:'T1498', subTechnique:'Direct Network Flood', subId:'T1498.001', url:'https://attack.mitre.org/techniques/T1498/' },
    killChain: [
      { phase:'Reconnaissance', desc:'Attacker scans for vulnerable IoT devices and servers to recruit into a botnet', icon:'🔍' },
      { phase:'Weaponize', desc:'Botnet C2 infrastructure set up; attack scripts deployed to infected nodes globally', icon:'⚙️' },
      { phase:'Delivery', desc:'Command sent to 10,000+ bots to simultaneously flood target with traffic', icon:'📡' },
      { phase:'Exploitation', desc:"Target's bandwidth saturated; legitimate requests cannot be processed", icon:'💥' },
      { phase:'Impact', desc:'Service goes offline; revenue loss and reputational damage to victim organization', icon:'🔴' },
    ],
    realWorld: [
      { name:'Mirai Botnet (2016)', target:'Dyn DNS Provider', impact:'Took down Twitter, Netflix, Reddit, and GitHub for hours across the US East Coast', scale:'1.2 Tbps — largest recorded DDoS at the time', badge:'Historic' },
      { name:'GitHub Attack (2018)', target:'GitHub.com', impact:'Largest DDoS ever recorded at the time; GitHub offline for ~10 minutes', scale:'1.35 Tbps via Memcached amplification', badge:'Record' },
      { name:'Google Cloud (2023)', target:'Google infrastructure', impact:'HTTP/2 Rapid Reset — 398 million requests per second peak', scale:'7.5× larger than any previous attack on record', badge:'Recent' },
    ],
    mitigations: {
      beginner:['Use a CDN like Cloudflare which absorbs attack traffic before it reaches your site','Enable DDoS protection offered by your hosting or cloud provider','Have a backup plan ready in case your website goes down temporarily'],
      intermediate:['Implement rate limiting and IP reputation filtering at your edge','Use Anycast network diffusion to spread traffic across many data centres','Configure SYN cookies to handle TCP flood attacks','Set up traffic scrubbing from providers like Akamai or Cloudflare'],
      expert:['Deploy BGP blackhole routing for upstream filtering at the ISP level','Implement RTBH (Remotely Triggered Black Hole) routing with your upstream provider','Use flowspec rules to drop malicious traffic at the router level','Deploy stateless ACLs at peering points — MITRE D3FEND: Network Traffic Filtering'],
    },
  },
  'Malware': {
    icon: '🦠', fullName: 'Malicious Software Infection',
    mitre: { tactic:'Execution', tacticId:'TA0002', technique:'User Execution', techniqueId:'T1204', subTechnique:'Malicious File', subId:'T1204.002', url:'https://attack.mitre.org/techniques/T1204/' },
    killChain: [
      { phase:'Reconnaissance', desc:'Attacker identifies targets via social media, LinkedIn profiles, or purchased contact lists', icon:'🔍' },
      { phase:'Weaponize', desc:'Malicious payload packaged inside an Office doc, PDF, or fake software installer', icon:'⚙️' },
      { phase:'Delivery', desc:'Payload sent via phishing email, malicious download link, or infected USB drive', icon:'📧' },
      { phase:'Exploitation', desc:'Victim opens the file; macro or exploit executes malware silently in the background', icon:'💥' },
      { phase:'Persistence', desc:'Malware adds registry keys or scheduled tasks to survive system reboots', icon:'🔗' },
      { phase:'C2 & Exfil', desc:'Malware calls home to attacker C2 server; data is stolen or ransomware is deployed', icon:'🔴' },
    ],
    realWorld: [
      { name:'Emotet (2014–2021)', target:'Global — banks, hospitals, governments', impact:'Most dangerous malware of the decade; delivered ransomware to thousands of organisations', scale:'$2.5B+ in damages globally', badge:'Historic' },
      { name:'NotPetya (2017)', target:'Ukraine → Global supply chains', impact:'Disguised as ransomware but was actually a wiper — permanently destroyed data', scale:'$10B+ in damages; Maersk alone lost $300M', badge:'Nation-State' },
      { name:'XZ Utils Backdoor (2024)', target:'Linux systems worldwide', impact:'Supply chain backdoor hidden in a widely-used compression library for 2+ years', scale:'Would have affected millions of servers if not caught', badge:'Recent' },
    ],
    mitigations: {
      beginner:['Never open email attachments from unknown or unexpected senders','Keep your antivirus and operating system up to date at all times','Only download software from official, trusted websites','Enable automatic OS updates so security patches are installed promptly'],
      intermediate:['Deploy EDR (Endpoint Detection & Response) on all company endpoints','Implement application allowlisting to block unknown executables','Disable Office macros globally via Group Policy','Use network segmentation to limit how far an infection can spread'],
      expert:['Deploy behavioural analysis EDR such as CrowdStrike Falcon or SentinelOne','Write and maintain YARA rules for IOC-based detection','Deploy deception technology (honeypots, canary tokens) for early detection','Apply MITRE D3FEND: Executable Allowlisting + Dynamic Analysis sandboxing'],
    },
  },
  'Phishing': {
    icon: '🎣', fullName: 'Phishing / Social Engineering',
    mitre: { tactic:'Initial Access', tacticId:'TA0001', technique:'Phishing', techniqueId:'T1566', subTechnique:'Spearphishing Attachment', subId:'T1566.001', url:'https://attack.mitre.org/techniques/T1566/' },
    killChain: [
      { phase:'Reconnaissance', desc:'Attacker researches the target via LinkedIn, company website, and social media', icon:'🔍' },
      { phase:'Weaponize', desc:'Fake email crafted to mimic a trusted sender — CEO, bank, IT help desk, or vendor', icon:'✉️' },
      { phase:'Delivery', desc:'Email sent with a malicious link or attachment; urgency and fear tactics pressure victim', icon:'📧' },
      { phase:'Exploitation', desc:'Victim clicks link → redirected to a fake login page that harvests credentials', icon:'💥' },
      { phase:'Lateral Movement', desc:'Stolen credentials used to access email, VPN, internal systems, and cloud services', icon:'🔗' },
      { phase:'Impact', desc:'Data exfiltrated, accounts taken over, or malware deployed inside the network', icon:'🔴' },
    ],
    realWorld: [
      { name:'Twitter Hack (2020)', target:'Twitter employees', impact:'High-profile accounts (Obama, Musk, Gates) hijacked via phone phishing of Twitter staff', scale:'Bitcoin scam netted $120K; massive reputational damage', badge:'High-Profile' },
      { name:'Ubiquiti BEC (2015)', target:'Ubiquiti Networks finance team', impact:"Employee phished into wiring $46.7M to attacker's overseas accounts", scale:'$46.7M stolen — never fully recovered', badge:'Financial' },
      { name:'MGM Resorts (2023)', target:'MGM IT Help Desk', impact:'Attackers called IT desk pretending to be employee; gained full network access in minutes', scale:'$100M+ in losses; casino systems offline for days', badge:'Recent' },
    ],
    mitigations: {
      beginner:['Always check the sender email address carefully — not just the display name','If an email urgently asks for your password, it is almost certainly fake','Enable two-factor authentication on every important account','When in doubt, call the sender directly on a number you already know'],
      intermediate:['Implement DMARC, DKIM, and SPF email authentication records on your domain','Deploy an email security gateway such as Proofpoint or Mimecast','Run regular phishing simulation training campaigns for all staff','Use hardware MFA tokens (YubiKey) rather than SMS-based 2FA'],
      expert:['Deploy AiTM-resistant FIDO2 / passkey authentication across your organisation','Implement Zero Trust Network Access — remove implicit trust from VPN','Configure Conditional Access Policies tied to device health and compliance','Monitor for impossible travel events and new device login anomalies'],
    },
  },
  'Ransomware': {
    icon: '🔒', fullName: 'Ransomware Encryption Attack',
    mitre: { tactic:'Impact', tacticId:'TA0040', technique:'Data Encrypted for Impact', techniqueId:'T1486', subTechnique:'N/A — top-level technique', subId:'T1486', url:'https://attack.mitre.org/techniques/T1486/' },
    killChain: [
      { phase:'Initial Access', desc:'Entry via phishing email, RDP brute force, or an unpatched vulnerability', icon:'🚪' },
      { phase:'Persistence', desc:'Backdoor installed; attacker lurks quietly for days or weeks mapping the network', icon:'🔗' },
      { phase:'Reconnaissance', desc:'Internal network mapped; valuable data, admin accounts, and backup systems located', icon:'🔍' },
      { phase:'Exfiltration', desc:"Sensitive data copied to attacker's servers — leverage for double extortion", icon:'📤' },
      { phase:'Weaponize', desc:'Ransomware binary deployed simultaneously to all reachable machines', icon:'⚙️' },
      { phase:'Encryption', desc:'Files encrypted with AES-256 + RSA-4096; ransom note dropped on every machine', icon:'🔴' },
    ],
    realWorld: [
      { name:'WannaCry (2017)', target:'NHS UK, FedEx, Deutsche Bahn, 150+ countries', impact:'Exploited EternalBlue; UK hospitals turned away patients and cancelled surgeries', scale:'$4B+ in damages; 300,000 machines across 150 countries', badge:'Historic' },
      { name:'Colonial Pipeline (2021)', target:'US fuel pipeline infrastructure', impact:'DarkSide ransomware shut down 45% of US East Coast fuel supply for 6 days', scale:'$4.4M ransom paid; national emergency declared', badge:'Critical Infra' },
      { name:'Change Healthcare (2024)', target:'US healthcare payment systems', impact:'Largest healthcare breach in US history; prescriptions delayed nationwide for weeks', scale:'$22M ransom paid; 100M+ patient records exposed', badge:'Recent' },
    ],
    mitigations: {
      beginner:['Keep regular backups stored on a separate drive not connected to your computer','Never pay the ransom — it encourages more attacks and recovery is not guaranteed','Keep all software and operating systems updated with the latest security patches','Be very careful opening email attachments, especially from unexpected senders'],
      intermediate:['Implement the 3-2-1 backup rule: 3 copies, 2 media types, 1 stored offsite','Disable RDP if not needed; where required, use VPN with MFA and restrict source IPs','Segment your network so ransomware cannot spread freely to all systems','Deploy Privileged Access Management (PAM) to limit blast radius of any compromised account'],
      expert:['Implement immutable backups with WORM (Write Once Read Many) storage','Deploy canary files and honeypot SMB shares to detect encryption in real-time','Use deception technology to detect lateral movement weeks before detonation','Apply MITRE D3FEND: Credential Hardening + Process Spawn Analysis'],
    },
  },
  'Data Breach': {
    icon: '🗄️', fullName: 'Data Exfiltration / Breach',
    mitre: { tactic:'Exfiltration', tacticId:'TA0010', technique:'Exfiltration Over C2 Channel', techniqueId:'T1041', subTechnique:'Automated Exfiltration', subId:'T1020', url:'https://attack.mitre.org/techniques/T1041/' },
    killChain: [
      { phase:'Initial Access', desc:'Attacker gains foothold via credential theft, SQL injection, or insider threat', icon:'🚪' },
      { phase:'Discovery', desc:'Database schemas enumerated; sensitive tables identified — PII, financial, medical', icon:'🔍' },
      { phase:'Collection', desc:'Data queried in bulk and staged in compressed, password-protected archives', icon:'📦' },
      { phase:'Exfiltration', desc:'Archives sent out via HTTPS, DNS tunneling, or cloud storage APIs', icon:'📤' },
      { phase:'Monetization', desc:'Data sold on dark web, used for identity theft, or held for ransom', icon:'🔴' },
    ],
    realWorld: [
      { name:'Yahoo Breach (2013–2014)', target:'Yahoo user database', impact:'All 3 billion Yahoo accounts compromised; not disclosed publicly until 2016', scale:'3 billion accounts — the largest data breach in history', badge:'Historic' },
      { name:'Equifax (2017)', target:'Equifax credit bureau', impact:'SSNs, DOBs, addresses of 147M Americans exposed via unpatched Apache Struts', scale:'$700M settlement; CEO resigned', badge:'Critical' },
      { name:'National Public Data (2024)', target:'US background check company', impact:'SSNs and addresses of nearly every American adult exposed in a single breach', scale:'2.9 billion records; company filed for bankruptcy', badge:'Recent' },
    ],
    mitigations: {
      beginner:['Use a unique strong password for every website — a password manager makes this easy','Check haveibeenpwned.com to see if your email appeared in known breaches','Set up credit monitoring alerts to catch fraudulent accounts opened in your name','Use virtual card numbers for online shopping to limit card exposure'],
      intermediate:['Encrypt all sensitive data at rest using AES-256 with managed encryption keys','Implement Data Loss Prevention (DLP) tools to detect unauthorised transfers','Apply principle of least privilege — staff only access data their role requires','Monitor database query patterns to detect anomalous bulk exports'],
      expert:['Implement column-level encryption for PII fields in your database schema','Deploy Database Activity Monitoring (DAM) with ML-based behavioural baselines','Use tokenization for payment card data to reduce PCI-DSS scope','Apply data masking in non-production environments — MITRE D3FEND: Data Encryption'],
    },
  },
  'SQL Injection': {
    icon: '💉', fullName: 'SQL Injection Attack',
    mitre: { tactic:'Initial Access', tacticId:'TA0001', technique:'Exploit Public-Facing Application', techniqueId:'T1190', subTechnique:'N/A — top-level technique', subId:'T1190', url:'https://attack.mitre.org/techniques/T1190/' },
    killChain: [
      { phase:'Reconnaissance', desc:'Attacker probes web forms, URL parameters, and API endpoints for injection points', icon:'🔍' },
      { phase:'Testing', desc:"Basic payloads like ' OR 1=1-- injected to confirm whether input reaches the database", icon:'🧪' },
      { phase:'Exploitation', desc:'Union-based or blind injection used to extract database schema and sensitive data', icon:'💥' },
      { phase:'Escalation', desc:'Admin credentials extracted; attacker may escalate to OS command execution', icon:'⬆️' },
      { phase:'Impact', desc:'Data dumped, application defaced, or OS commands executed via xp_cmdshell', icon:'🔴' },
    ],
    realWorld: [
      { name:'Heartland Payments (2008)', target:'Heartland Payment Systems', impact:'SQLi used to install spyware on payment network; 130 million cards stolen', scale:'$140M in fines and settlements', badge:'Historic' },
      { name:'Sony PSN (2011)', target:'Sony PlayStation Network', impact:"LulzSec used basic SQLi on Sony's website; 77M PSN accounts compromised", scale:'77M accounts; PlayStation Network offline for 23 days', badge:'High-Profile' },
      { name:'MOVEit Transfer (2023)', target:'2,000+ organisations globally', impact:'SQLi zero-day in MOVEit software; exploited by Cl0p ransomware group at mass scale', scale:'62M individuals affected across NHS, Shell, US govt agencies', badge:'Recent' },
    ],
    mitigations: {
      beginner:['SQL Injection happens because websites trust user input without checking it — developers must fix this','As a user: look for signs a site is well-maintained and report suspicious form behaviour','Avoid reusing passwords — if one site is breached via SQLi, your credentials are exposed'],
      intermediate:['Use parameterised queries or prepared statements everywhere — this is the #1 fix','Deploy a Web Application Firewall (WAF) with the OWASP Core Rule Set','Implement strict input validation and output encoding on every user-facing field','Run OWASP ZAP or Burp Suite scans on your apps as part of CI/CD'],
      expert:['Use ORM frameworks that enforce parameterisation by default (SQLAlchemy, Hibernate)','Implement stored procedures with a minimal-privilege DB account for the application','Deploy Runtime Application Self-Protection (RASP) for in-process attack blocking','Apply MITRE D3FEND: Input Validation + Application Configuration Hardening'],
    },
  },
};

const OVERVIEW_TEXT = {
  beginner: {
    DDoS:"A DDoS attack is like thousands of people calling a restaurant at the same time so real customers can't get through. Hackers flood a website with fake traffic until it crashes.",
    Malware:"Malware is malicious software secretly installed on your device to steal data, spy on you, or damage your system. Think of it as a digital burglar hiding inside your computer.",
    Phishing:"Phishing is when attackers disguise themselves as trustworthy sources to trick you into handing over passwords or clicking dangerous links.",
    Ransomware:"Ransomware locks all your files with unbreakable encryption and demands you pay money to unlock them. Even paying often doesn't guarantee recovery.",
    'Data Breach':"A data breach is when hackers break into a company's database and steal personal information — passwords, credit cards, social security numbers — then sell it on the dark web.",
    'SQL Injection':"SQL Injection is a trick where hackers type special code into a website's search box to fool the database into handing over secret information it was never meant to share.",
  },
  intermediate: {
    DDoS:"This DDoS attack leverages a botnet to generate volumetric flood traffic — typically HTTP or UDP — overwhelming the target's upstream bandwidth and preventing legitimate users from reaching the service.",
    Malware:"This malware establishes persistence via registry run keys and scheduled tasks, then communicates with C2 infrastructure over encrypted channels to receive commands and exfiltrate data.",
    Phishing:"This spearphishing campaign uses lookalike domains with valid SSL certificates to harvest credentials. Attackers research targets on LinkedIn to personalise lures and evade spam filters.",
    Ransomware:"This ransomware gains initial access via phishing or RDP brute force, moves laterally through the network, disables backup services, then simultaneously encrypts files across all reachable hosts.",
    'Data Breach':"This breach exploited an authenticated access path to enumerate and bulk-dump sensitive database tables, using slow low-volume queries to stay below alerting thresholds.",
    'SQL Injection':"This attack uses union-based SQL injection to extract data from tables outside the intended query scope. Boolean-based blind injection is used to enumerate the full database schema.",
  },
  expert: {
    DDoS:"HTTP/2 Rapid Reset or Memcached-amplified UDP flood. Attacker leverages IoT botnet (Mirai variant) for 300Gbps+ volumetric attack. MITRE T1498.001. Mitigate via BGP flowspec, upstream scrubbing, and SYN cookies.",
    Malware:"APT implant using process hollowing (T1055.012) and DLL side-loading (T1574.002). C2 via DNS-over-HTTPS (T1071.004). Persistence via COM hijacking (T1546.015). Detection: YARA rules + beacon timing analysis.",
    Phishing:"AiTM reverse proxy attack using Evilginx2 targeting TOTP-based MFA (T1539). Session cookie theft bypasses 2FA. Mitigate with FIDO2 hardware keys, Conditional Access with device compliance, and EAP-TLS.",
    Ransomware:"LockBit 3.0 / BlackCat affiliate model. ChaCha20 encryption + RSA-4096 key wrapping. Double extortion via data leak site. Initial access via CVE-2023-3519 (Citrix Bleed). Remediate: WORM backups, PAM, LAPS.",
    'Data Breach':"Second-order SQL injection triggering stored payloads. OOB exfiltration via DNS (T1048.003) to evade egress filtering. Mitigate: stored procedures, DAM with ML baseline, column-level AES-256, query allowlisting.",
    'SQL Injection':"Polyglot SQLi payloads bypassing WAF signatures. Stacked queries for RCE via xp_cmdshell (MSSQL) or UDF injection (MySQL). MITRE T1190. Remediation: parameterised queries, RASP, DAM, least-privilege DB accounts.",
  },
};

const getSeverityColor = (s) => ({ critical:'#ff2d55', high:'#ff6b35', medium:'#ffd60a', low:'#30d158' }[s] || '#00c8ff');
const getSeverityGlow  = (s) => ({ critical:'rgba(255,45,85,0.6)', high:'rgba(255,107,53,0.6)', medium:'rgba(255,214,10,0.6)', low:'rgba(48,209,88,0.6)' }[s] || 'rgba(0,200,255,0.4)');
const getBadgeColor    = (b) => ({ Historic:'#7b2dff', Record:'#ff2d55', Recent:'#00c8ff', 'Nation-State':'#ff2d55', Financial:'#ffd60a', Critical:'#ff2d55', 'Critical Infra':'#ff6b35', 'High-Profile':'#a855f7' }[b] || '#4a5568');

const ATTACK_COLORS = { DDoS:'#00c8ff', Malware:'#ff2d55', Phishing:'#ffd60a', Ransomware:'#ff6b35', 'Data Breach':'#a855f7', 'SQL Injection':'#30d158' };

const countries = [
  { name:'United States', code:'US', flag:'🇺🇸', coords:[-95.7129,37.0902] },
  { name:'Russia',         code:'RU', flag:'🇷🇺', coords:[105.3188,61.5240] },
  { name:'China',          code:'CN', flag:'🇨🇳', coords:[104.1954,35.8617] },
  { name:'United Kingdom', code:'GB', flag:'🇬🇧', coords:[-3.4360,55.3781] },
  { name:'Germany',        code:'DE', flag:'🇩🇪', coords:[10.4515,51.1657] },
  { name:'India',          code:'IN', flag:'🇮🇳', coords:[78.9629,20.5937] },
  { name:'Brazil',         code:'BR', flag:'🇧🇷', coords:[-51.9253,-14.2350] },
  { name:'Japan',          code:'JP', flag:'🇯🇵', coords:[138.2529,36.2048] },
  { name:'France',         code:'FR', flag:'🇫🇷', coords:[2.2137,46.2276] },
  { name:'Australia',      code:'AU', flag:'🇦🇺', coords:[133.7751,-25.2744] },
  { name:'Canada',         code:'CA', flag:'🇨🇦', coords:[-106.3468,56.1304] },
  { name:'South Korea',    code:'KR', flag:'🇰🇷', coords:[127.7669,35.9078] },
  { name:'Netherlands',    code:'NL', flag:'🇳🇱', coords:[5.2913,52.1326] },
  { name:'Singapore',      code:'SG', flag:'🇸🇬', coords:[103.8198,1.3521] },
  { name:'South Africa',   code:'ZA', flag:'🇿🇦', coords:[22.9375,-30.5595] },
];

// ── Mini chart components ────────────────────────────────────────────────────
function Sparkline({ data, color='#00c8ff', width=160, height=36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v,i) => `${(i/(data.length-1))*width},${height-(v/max)*height*0.9-2}`).join(' ');
  const fill= `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.35"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={fill} fill="url(#sg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function DonutChart({ data }) {
  const total   = Object.values(data).reduce((a,b)=>a+b,0)||1;
  const entries = Object.entries(data).filter(([,v])=>v>0);
  let cum = 0;
  const cx=54,cy=54,r=40,circ=2*Math.PI*r;
  const slices = entries.map(([key,val])=>{ const pct=val/total,off=circ*(1-pct),rot=cum*360; cum+=pct; return{key,val,pct,off,rot,color:ATTACK_COLORS[key]||'#4a5568'}; });
  return (
    <div style={{display:'flex',gap:'14px',alignItems:'center'}}>
      <svg width={108} height={108}>
        {slices.map(s=>(
          <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
            strokeDasharray={`${circ*s.pct} ${circ*(1-s.pct)}`} strokeDashoffset={circ*0.25}
            transform={`rotate(${s.rot-90} ${cx} ${cy})`}
            style={{filter:`drop-shadow(0 0 4px ${s.color}88)`}}/>
        ))}
        <text x={cx} y={cy-4} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontFamily="Orbitron" fontWeight="900">{total}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="#4a5568" fontSize="8" fontFamily="Share Tech Mono">TOTAL</text>
      </svg>
      <div style={{flex:1}}>
        {slices.map(s=>(
          <div key={s.key} style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'5px'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:s.color,flexShrink:0,boxShadow:`0 0 6px ${s.color}`}}/>
            <span style={{color:'#718096',fontSize:'10px',flex:1}}>{s.key}</span>
            <span style={{color:s.color,fontSize:'10px',fontFamily:'Orbitron'}}>{Math.round(s.pct*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d=>d.count),1);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
      {data.map(item=>(
        <div key={item.code} style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'13px',flexShrink:0}}>{item.flag}</span>
          <span style={{color:'#718096',fontSize:'10px',width:'92px',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
          <div style={{flex:1,height:'5px',background:'rgba(0,200,255,0.07)',borderRadius:'3px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${(item.count/max)*100}%`,background:'linear-gradient(90deg,#00c8ff,#7b2dff)',borderRadius:'3px',boxShadow:'0 0 7px rgba(0,200,255,0.4)',transition:'width 0.6s ease'}}/>
          </div>
          <span style={{color:'#00c8ff',fontSize:'10px',fontFamily:'Orbitron',width:'26px',textAlign:'right',flexShrink:0}}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN HOME COMPONENT ─────────────────────────────────────────────────────
export default function Home() {
  const [attacks,      setAttacks     ] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [stats,        setStats       ] = useState({ attacksToday:45234, attacksActive:0 });
  const [learningMode, setLearningMode] = useState('beginner');
  const [activeTab,    setActiveTab   ] = useState('overview');
  const [mapLoaded,    setMapLoaded   ] = useState(false);
  const [globeMode,    setGlobeMode   ] = useState(true);
  const [showStats,    setShowStats   ] = useState(false);
  const [showGami,     setShowGami    ] = useState(false);   // ← gamification

  // Analytics
  const [targetCounts, setTargetCounts] = useState({});
  const [sourceCounts, setSourceCounts] = useState({});
  const [typeCounts,   setTypeCounts  ] = useState({});
  const [apmHistory,   setApmHistory  ] = useState(Array(30).fill(0));
  const apmBucket = useRef(0);

  const mapRef             = useRef(null);
  const mapInstanceRef     = useRef(null);
  const attackLayersRef    = useRef([]);
  const echoLayersRef      = useRef([]);
  const clusterCountRef    = useRef({});
  const clusterTimerRef    = useRef({});
  const spinRef            = useRef(null);
  const userInteractingRef = useRef(false);
  const heatmapDataRef     = useRef({});

  const attackTypes = ['DDoS','Malware','Phishing','Ransomware','Data Breach','SQL Injection'];
  const severities  = ['critical','high','medium','low'];

  const createBezierArc = (start, end, steps=80) => {
    const c=[]; const ml=(start[0]+end[0])/2, mlat=(start[1]+end[1])/2+Math.abs(end[0]-start[0])*0.25;
    for(let i=0;i<=steps;i++){const t=i/steps,mt=1-t;c.push([mt*mt*start[0]+2*mt*t*ml+t*t*end[0],mt*mt*start[1]+2*mt*t*mlat+t*t*end[1]]);}
    return c;
  };

  const updateHeatmap = useCallback((code) => {
    const map = mapInstanceRef.current;
    if (!map || !map.getSource('heatmap-source')) return;
    heatmapDataRef.current[code] = Math.min((heatmapDataRef.current[code]||0)+0.15,1.0);
    const features = countries.map(c=>({type:'Feature',geometry:{type:'Point',coordinates:c.coords},properties:{intensity:heatmapDataRef.current[c.code]||0}}));
    map.getSource('heatmap-source').setData({type:'FeatureCollection',features});
    setTimeout(()=>{
      heatmapDataRef.current[code]=Math.max((heatmapDataRef.current[code]||0)-0.08,0);
      if(map.getSource('heatmap-source')){const f=countries.map(c=>({type:'Feature',geometry:{type:'Point',coordinates:c.coords},properties:{intensity:heatmapDataRef.current[c.code]||0}}));map.getSource('heatmap-source').setData({type:'FeatureCollection',features:f});}
    },8000);
  },[]);

  const triggerClusterExplosion = useCallback((coords, color) => {
    const map = mapInstanceRef.current; if(!map)return;
    const uid=`clust-${Date.now()}`;
    map.addSource(uid,{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:coords}}});
    map.addLayer({id:uid,type:'circle',source:uid,paint:{'circle-radius':0,'circle-color':'transparent','circle-stroke-color':color,'circle-stroke-width':3,'circle-stroke-opacity':0.9,'circle-pitch-alignment':'map'}});
    const s=performance.now();
    const a=(now)=>{const t=Math.min((now-s)/1200,1),e=1-Math.pow(1-t,2);if(map.getLayer(uid)){map.setPaintProperty(uid,'circle-radius',e*60);map.setPaintProperty(uid,'circle-stroke-opacity',(1-t)*0.9);}if(t<1)requestAnimationFrame(a);else{if(map.getLayer(uid))map.removeLayer(uid);if(map.getSource(uid))map.removeSource(uid);}};
    requestAnimationFrame(a);
  },[]);

  const addAttackToMap = useCallback((attack) => {
    const map = mapInstanceRef.current; if(!map)return;
    while(attackLayersRef.current.length>=15){const old=attackLayersRef.current.shift();['glowId','lineId','dotId','pulseId'].forEach(k=>{if(old[k]){if(map.getLayer(old[k]))map.removeLayer(old[k]);if(map.getSource(old[k]))map.removeSource(old[k]);}});}
    const uid=`${attack.id}-${Date.now()}`,lineId=`line-${uid}`,glowId=`glow-${uid}`,dotId=`dot-${uid}`,pulseId=`pulse-${uid}`;
    const color=getSeverityColor(attack.severity),arc=createBezierArc(attack.source.coords,attack.target.coords);
    map.addSource(glowId,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:[attack.source.coords]}}});
    map.addLayer({id:glowId,type:'line',source:glowId,paint:{'line-color':color,'line-width':8,'line-opacity':0.25,'line-blur':6}});
    map.addSource(lineId,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:[attack.source.coords]}}});
    map.addLayer({id:lineId,type:'line',source:lineId,paint:{'line-color':color,'line-width':1.5,'line-opacity':0.95}});
    map.addSource(pulseId,{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:attack.target.coords}}});
    map.addLayer({id:pulseId,type:'circle',source:pulseId,paint:{'circle-radius':0,'circle-color':'transparent','circle-stroke-color':color,'circle-stroke-width':2,'circle-stroke-opacity':0,'circle-pitch-alignment':'map'}});
    map.addSource(dotId,{type:'geojson',data:{type:'Feature',geometry:{type:'Point',coordinates:attack.source.coords}}});
    map.addLayer({id:dotId,type:'circle',source:dotId,paint:{'circle-radius':4,'circle-color':color,'circle-opacity':1,'circle-stroke-width':2,'circle-stroke-color':'#fff','circle-stroke-opacity':0.8,'circle-pitch-alignment':'map'}});
    [pulseId,dotId].forEach(id=>{map.on('click',id,()=>{setSelectedAttack(attack);setActiveTab('overview');setShowGami(false);setShowStats(false);});map.on('mouseenter',id,()=>{map.getCanvas().style.cursor='pointer';});map.on('mouseleave',id,()=>{map.getCanvas().style.cursor='';});});
    attackLayersRef.current.push({lineId,glowId,dotId,pulseId});
    const total=arc.length,dur=900,t0=performance.now();
    const animPulse=(st,ring)=>{const d=1200,dl=ring*400;const tick=(now)=>{const t=Math.min((now-st-dl)/d,1);if(t<0){requestAnimationFrame(tick);return;}if(map.getLayer(pulseId)){map.setPaintProperty(pulseId,'circle-stroke-opacity',(1-t)*0.7);map.setPaintProperty(pulseId,'circle-radius',t*28);}if(t<1)requestAnimationFrame(tick);else if(ring<2)animPulse(st,ring+1);};requestAnimationFrame(tick);};
    const draw=(now)=>{const p=Math.min((now-t0)/dur,1),e=1-Math.pow(1-p,3),vis=arc.slice(0,Math.max(2,Math.floor(e*total)));const d={type:'Feature',geometry:{type:'LineString',coordinates:vis}};if(map.getSource(lineId))map.getSource(lineId).setData(d);if(map.getSource(glowId))map.getSource(glowId).setData(d);if(map.getSource(dotId))map.getSource(dotId).setData({type:'Feature',geometry:{type:'Point',coordinates:vis[vis.length-1]}});if(p<1)requestAnimationFrame(draw);else{if(map.getSource(dotId))map.getSource(dotId).setData({type:'Feature',geometry:{type:'Point',coordinates:attack.target.coords}});animPulse(performance.now(),0);const tc=attack.target.code;clusterCountRef.current[tc]=(clusterCountRef.current[tc]||0)+1;if(clusterTimerRef.current[tc])clearTimeout(clusterTimerRef.current[tc]);clusterTimerRef.current[tc]=setTimeout(()=>{clusterCountRef.current[tc]=0;},4000);if(clusterCountRef.current[tc]>=3){triggerClusterExplosion(attack.target.coords,color);clusterCountRef.current[tc]=0;}const echoId=`echo-${uid}`;map.addSource(echoId,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:arc}}});map.addLayer({id:echoId,type:'line',source:echoId,paint:{'line-color':color,'line-width':1,'line-opacity':0.3,'line-blur':2}});const es=performance.now();const fe=(now)=>{const t=Math.min((now-es)/60000,1);if(map.getLayer(echoId))map.setPaintProperty(echoId,'line-opacity',(1-t)*0.3);if(t<1)requestAnimationFrame(fe);else{if(map.getLayer(echoId))map.removeLayer(echoId);if(map.getSource(echoId))map.removeSource(echoId);}};requestAnimationFrame(fe);}};
    requestAnimationFrame(draw);
    setTimeout(()=>{const fs=performance.now();const fo=(now)=>{const t=Math.min((now-fs)/800,1),op=1-t;if(map.getLayer(lineId))map.setPaintProperty(lineId,'line-opacity',op*0.95);if(map.getLayer(glowId))map.setPaintProperty(glowId,'line-opacity',op*0.25);if(map.getLayer(dotId))map.setPaintProperty(dotId,'circle-opacity',op);if(t<1)requestAnimationFrame(fo);else{[glowId,lineId,dotId,pulseId].forEach(id=>{if(map.getLayer(id))map.removeLayer(id);if(map.getSource(id))map.removeSource(id);});attackLayersRef.current=attackLayersRef.current.filter(l=>l.lineId!==lineId);}};requestAnimationFrame(fo);},8000);
    updateHeatmap(attack.target.code);
  },[updateHeatmap,triggerClusterExplosion]);

  // Mapbox init
  useEffect(()=>{
    if(typeof window==='undefined'||!window.mapboxgl)return;
    window.mapboxgl.accessToken='pk.eyJ1IjoiYXllc2hhc3EiLCJhIjoiY21qNDBvOGF0MDB3ODNmcTJwbXFuaTY3eSJ9.EKiY5BPeiDF3s-tYkHGUfg';
    const map=new window.mapboxgl.Map({container:mapRef.current,style:'mapbox://styles/mapbox/dark-v11',projection:'globe',zoom:1.8,center:[15,25],pitch:0,antialias:true});
    map.on('load',()=>{
      map.setFog({color:'rgb(6,8,20)','high-color':'rgb(20,40,100)','horizon-blend':0.04,'space-color':'rgb(4,4,16)','star-intensity':0.6});
      map.addSource('heatmap-source',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
      map.addLayer({id:'country-heat',type:'circle',source:'heatmap-source',paint:{'circle-radius':['interpolate',['linear'],['get','intensity'],0,0,1,80],'circle-color':['interpolate',['linear'],['get','intensity'],0,'rgba(255,45,85,0)',0.3,'rgba(255,45,85,0.3)',1,'rgba(255,45,85,0.7)'],'circle-blur':1.5,'circle-opacity':['interpolate',['linear'],['get','intensity'],0,0,0.1,0.6,1,0.9],'circle-pitch-alignment':'map'}});
      map.addLayer({id:'country-heat-outer',type:'circle',source:'heatmap-source',paint:{'circle-radius':['interpolate',['linear'],['get','intensity'],0,0,1,140],'circle-color':'rgba(255,45,85,0.15)','circle-blur':2.5,'circle-opacity':['interpolate',['linear'],['get','intensity'],0,0,0.2,0.4,1,0.6],'circle-pitch-alignment':'map'}});
      const spin=()=>{if(!userInteractingRef.current){const c=map.getCenter();map.setCenter([c.lng-0.012,c.lat]);}spinRef.current=requestAnimationFrame(spin);};
      spinRef.current=requestAnimationFrame(spin);
      map.on('mousedown',()=>{userInteractingRef.current=true;});map.on('touchstart',()=>{userInteractingRef.current=true;});map.on('mouseup',()=>{userInteractingRef.current=false;});map.on('touchend',()=>{userInteractingRef.current=false;});
      mapInstanceRef.current=map;setMapLoaded(true);
    });
    return()=>{if(spinRef.current)cancelAnimationFrame(spinRef.current);if(mapInstanceRef.current)mapInstanceRef.current.remove();};
  },[]);

  useEffect(()=>{ const map=mapInstanceRef.current;if(!map)return;map.setProjection(globeMode?'globe':'mercator'); },[globeMode]);

  useEffect(()=>{
    if(!mapLoaded)return;
    const gen=()=>{const s=countries[Math.floor(Math.random()*countries.length)];let t=countries[Math.floor(Math.random()*countries.length)];while(t.code===s.code)t=countries[Math.floor(Math.random()*countries.length)];return{id:Date.now()+Math.random(),timestamp:new Date(),source:s,target:t,attackType:attackTypes[Math.floor(Math.random()*attackTypes.length)],severity:severities[Math.floor(Math.random()*severities.length)],protocol:['HTTP','TCP','UDP','ICMP'][Math.floor(Math.random()*4)],port:Math.floor(Math.random()*65535),sector:['Financial','Healthcare','Government','Education','Retail'][Math.floor(Math.random()*5)],affected:Math.floor(Math.random()*10000)+100};};
    setTimeout(()=>{const a=gen();setAttacks([a]);addAttackToMap(a);},100);
    setTimeout(()=>{const a=gen();setAttacks(p=>[a,...p]);addAttackToMap(a);},400);
    const iv=setInterval(()=>{const a=gen();setAttacks(p=>[a,...p].slice(0,30));setStats(p=>({attacksToday:p.attacksToday+1,attacksActive:Math.floor(Math.random()*150)+50}));setTargetCounts(p=>({...p,[a.target.code]:(p[a.target.code]||0)+1}));setSourceCounts(p=>({...p,[a.source.code]:(p[a.source.code]||0)+1}));setTypeCounts(p=>({...p,[a.attackType]:(p[a.attackType]||0)+1}));apmBucket.current++;addAttackToMap(a);},800);
    const aiv=setInterval(()=>{setApmHistory(p=>{const n=[...p.slice(1),apmBucket.current];apmBucket.current=0;return n;});},10000);
    return()=>{clearInterval(iv);clearInterval(aiv);};
  },[mapLoaded,addAttackToMap]);

  const top5Targets = countries.map(c=>({...c,count:targetCounts[c.code]||0})).sort((a,b)=>b.count-a.count).slice(0,5).filter(c=>c.count>0);
  const top5Sources = countries.map(c=>({...c,count:sourceCounts[c.code]||0})).sort((a,b)=>b.count-a.count).slice(0,5).filter(c=>c.count>0);

  const info = selectedAttack ? ATTACK_DATA[selectedAttack.attackType] : null;
  const TABS = [{id:'overview',label:'Overview',icon:'📊'},{id:'killchain',label:'Kill Chain',icon:'⛓️'},{id:'mitre',label:'MITRE',icon:'🎯'},{id:'examples',label:'Examples',icon:'📰'},{id:'defend',label:'Defend',icon:'🛡️'}];

  // Right panel width logic
  const rightPanelWidth = selectedAttack ? 500 : showStats ? 380 : showGami ? 440 : 0;

  return (
    <>
      <Head>
        <title>BreachMap Live — Real-Time Cyber Threat Intelligence</title>
        <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet'/>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      </Head>
      <Script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js" strategy="beforeInteractive"/>

      <div style={{width:'100vw',height:'100vh',overflow:'hidden',background:'#04040f',fontFamily:"'Share Tech Mono',monospace"}}>

        {/* ── HEADER ── */}
        <header style={{position:'fixed',top:0,left:0,right:0,height:'68px',background:'linear-gradient(180deg,rgba(4,4,15,0.97) 0%,rgba(4,4,15,0.75) 100%)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(0,200,255,0.15)',display:'flex',alignItems:'center',padding:'0 24px',zIndex:100,gap:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'34px',height:'34px',borderRadius:'8px',background:'linear-gradient(135deg,#00c8ff,#7b2dff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',boxShadow:'0 0 18px rgba(0,200,255,0.5)'}}>⚡</div>
            <h1 style={{fontFamily:'Orbitron',fontSize:'18px',fontWeight:900,margin:0,background:'linear-gradient(135deg,#00c8ff 0%,#7b2dff 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'3px'}}>BREACHMAP LIVE</h1>
          </div>

          <div style={{marginLeft:'auto',display:'flex',gap:'12px',alignItems:'center'}}>
            <StatBadge label="Attacks Today" value={stats.attacksToday.toLocaleString()} color="#00c8ff"/>
            <StatBadge label="Active Now" value={stats.attacksActive||'—'} color="#ff2d55"/>

            <HdrBtn active={globeMode} onClick={()=>setGlobeMode(g=>!g)} color="#00c8ff">{globeMode?'🌐 GLOBE':'🗺️ FLAT'}</HdrBtn>
            <HdrBtn active={showStats} onClick={()=>{setShowStats(s=>!s);setShowGami(false);setSelectedAttack(null);}} color="#ffd60a">📊 ANALYTICS</HdrBtn>
            {/* ── GAMIFICATION BUTTON ── */}
            <HdrBtn active={showGami} onClick={()=>{setShowGami(g=>!g);setShowStats(false);setSelectedAttack(null);}} color="#a855f7">🏆 ANALYST</HdrBtn>

            <div style={{display:'flex',alignItems:'center',gap:'7px',padding:'6px 14px',borderRadius:'20px',background:'rgba(255,45,85,0.1)',border:'1px solid rgba(255,45,85,0.4)',fontSize:'11px',letterSpacing:'2px',color:'#ff2d55'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#ff2d55',display:'block',animation:'blink 1s infinite'}}/>LIVE
            </div>
          </div>
        </header>

        {/* ── MAP ── */}
        <div ref={mapRef} style={{position:'fixed',top:'68px',left:0,right:`${rightPanelWidth}px`,bottom:0,transition:'right 0.4s cubic-bezier(0.16,1,0.3,1)'}}/>

        {/* ── LIVE FEED ── */}
        <div style={{position:'fixed',bottom:'20px',left:'20px',width:'285px',maxHeight:'250px',overflowY:'auto',background:'rgba(6,8,20,0.92)',backdropFilter:'blur(20px)',border:'1px solid rgba(0,200,255,0.15)',borderRadius:'12px',padding:'14px',zIndex:50}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#ff2d55',display:'block',animation:'blink 1s infinite'}}/>
            <span style={{fontFamily:'Orbitron',fontSize:'11px',color:'#00c8ff',letterSpacing:'2px'}}>LIVE FEED</span>
          </div>
          {attacks.map(a=>(
            <div key={a.id} onClick={()=>{setSelectedAttack(a);setActiveTab('overview');setShowGami(false);setShowStats(false);}} style={{padding:'9px 11px',background:'rgba(0,200,255,0.03)',borderLeft:`3px solid ${getSeverityColor(a.severity)}`,borderRadius:'6px',marginBottom:'7px',fontSize:'11px',cursor:'pointer',transition:'all 0.2s',animation:'slideIn 0.4s ease'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.1)';e.currentTarget.style.transform='translateX(4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.03)';e.currentTarget.style.transform='translateX(0)';}}>
              <div style={{color:'#4a5568',fontSize:'9px',marginBottom:'2px'}}>{a.timestamp.toLocaleTimeString()}</div>
              <div style={{color:'#e2e8f0',display:'flex',alignItems:'center',gap:'5px',flexWrap:'wrap'}}>
                <span style={{color:getSeverityColor(a.severity),fontSize:'9px',fontWeight:700,textTransform:'uppercase'}}>{a.severity}</span>
                <span style={{color:'#4a5568'}}>·</span><span>{a.attackType}</span>
                <span style={{color:'#4a5568'}}>·</span><span>{a.source.flag}→{a.target.flag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── LEGEND ── */}
        <div style={{position:'fixed',bottom:'20px',right:`${rightPanelWidth+20}px`,background:'rgba(6,8,20,0.92)',backdropFilter:'blur(20px)',border:'1px solid rgba(0,200,255,0.15)',borderRadius:'12px',padding:'12px 16px',zIndex:50,transition:'right 0.4s cubic-bezier(0.16,1,0.3,1)',fontSize:'11px'}}>
          <div style={{fontFamily:'Orbitron',fontSize:'9px',color:'#00c8ff',letterSpacing:'2px',marginBottom:'10px'}}>SEVERITY</div>
          {[['critical','#ff2d55'],['high','#ff6b35'],['medium','#ffd60a'],['low','#30d158']].map(([l,c])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'7px'}}>
              <div style={{width:'22px',height:'2px',background:c,boxShadow:`0 0 5px ${c}`,borderRadius:2}}/>
              <div style={{width:6,height:6,borderRadius:'50%',background:c,boxShadow:`0 0 7px ${c}`}}/>
              <span style={{color:'#718096',textTransform:'uppercase',letterSpacing:'1px',fontSize:'10px'}}>{l}</span>
            </div>
          ))}
        </div>

        {/* ── ANALYTICS PANEL ── */}
        {showStats && !selectedAttack && !showGami && (
          <div style={{position:'fixed',right:0,top:'68px',bottom:0,width:'380px',background:'rgba(5,6,18,0.97)',backdropFilter:'blur(24px)',borderLeft:'1px solid rgba(0,200,255,0.12)',overflowY:'auto',zIndex:90,animation:'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',padding:'20px'}}>
            <div style={{fontFamily:'Orbitron',fontSize:'13px',color:'#00c8ff',letterSpacing:'3px',marginBottom:'20px',paddingBottom:'10px',borderBottom:'1px solid rgba(0,200,255,0.1)'}}>📊 ANALYTICS</div>
            <SectionLabel>ATTACKS / 10 SEC</SectionLabel>
            <div style={{padding:'14px',background:'rgba(0,200,255,0.04)',border:'1px solid rgba(0,200,255,0.1)',borderRadius:'10px',marginBottom:'18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'10px'}}>
                <span style={{color:'#4a5568',fontSize:'10px'}}>Last 5 minutes</span>
                <span style={{color:'#00c8ff',fontFamily:'Orbitron',fontSize:'16px',fontWeight:700}}>{apmHistory[apmHistory.length-1]||0}<span style={{fontSize:'9px',color:'#4a5568',marginLeft:'4px'}}>/10s</span></span>
              </div>
              <Sparkline data={apmHistory} color="#00c8ff" width={330} height={44}/>
            </div>
            <SectionLabel>ATTACK TYPE BREAKDOWN</SectionLabel>
            <div style={{padding:'14px',background:'rgba(0,200,255,0.04)',border:'1px solid rgba(0,200,255,0.1)',borderRadius:'10px',marginBottom:'18px'}}>
              {Object.keys(typeCounts).length>0?<DonutChart data={typeCounts}/>:<Placeholder/>}
            </div>
            <SectionLabel>TOP TARGETED COUNTRIES</SectionLabel>
            <div style={{padding:'14px',background:'rgba(255,45,85,0.04)',border:'1px solid rgba(255,45,85,0.12)',borderRadius:'10px',marginBottom:'18px'}}>
              {top5Targets.length>0?<BarChart data={top5Targets}/>:<Placeholder/>}
            </div>
            <SectionLabel>TOP ATTACKER ORIGINS</SectionLabel>
            <div style={{padding:'14px',background:'rgba(123,45,255,0.04)',border:'1px solid rgba(123,45,255,0.12)',borderRadius:'10px'}}>
              {top5Sources.length>0?(
                <div>{top5Sources.map((c,i)=>(
                  <div key={c.code} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<top5Sources.length-1?'1px solid rgba(0,200,255,0.06)':'none'}}>
                    <span style={{fontFamily:'Orbitron',fontSize:'10px',color:i===0?'#ffd60a':i===1?'#718096':i===2?'#ff6b35':'#4a5568',width:'18px',flexShrink:0}}>#{i+1}</span>
                    <span style={{fontSize:'15px'}}>{c.flag}</span>
                    <span style={{color:'#a0aec0',fontSize:'10px',flex:1}}>{c.name}</span>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <div style={{width:`${Math.round((c.count/top5Sources[0].count)*46)}px`,height:'3px',background:'linear-gradient(90deg,#7b2dff,#ff2d55)',borderRadius:'2px',minWidth:'3px'}}/>
                      <span style={{color:'#7b2dff',fontFamily:'Orbitron',fontSize:'10px'}}>{c.count}</span>
                    </div>
                  </div>
                ))}</div>
              ):<Placeholder/>}
            </div>
          </div>
        )}

        {/* ── GAMIFICATION PANEL ── */}
        {showGami && !selectedAttack && (
          <GamificationPanel
            currentAttackType={attacks[0]?.attackType || null}
            onClose={() => setShowGami(false)}
          />
        )}

        {/* ── ATTACK DETAIL PANEL ── */}
        {selectedAttack && info && (
          <div style={{position:'fixed',right:0,top:'68px',bottom:0,width:'500px',background:'rgba(5,6,18,0.99)',backdropFilter:'blur(24px)',borderLeft:'1px solid rgba(0,200,255,0.12)',overflowY:'auto',zIndex:91,animation:'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'22px 22px 0',borderBottom:'1px solid rgba(0,200,255,0.1)',flexShrink:0,position:'sticky',top:0,background:'rgba(5,6,18,0.99)',zIndex:10}}>
              <button onClick={()=>setSelectedAttack(null)} style={{position:'absolute',top:'18px',right:'18px',width:'30px',height:'30px',background:'rgba(255,45,85,0.15)',border:'1px solid rgba(255,45,85,0.4)',borderRadius:'50%',color:'#ff2d55',fontSize:'13px',cursor:'pointer',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#ff2d55';e.currentTarget.style.color='white';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,45,85,0.15)';e.currentTarget.style.color='#ff2d55';}}>✕</button>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                <span style={{fontSize:'26px'}}>{info.icon}</span>
                <div><div style={{fontFamily:'Orbitron',fontSize:'17px',fontWeight:900,color:'#f0f4ff'}}>{selectedAttack.attackType}</div><div style={{color:'#4a5568',fontSize:'10px',marginTop:'1px'}}>{info.fullName}</div></div>
                <span style={{marginLeft:'auto',marginRight:'36px',padding:'4px 10px',borderRadius:'20px',fontSize:'9px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',background:`${getSeverityColor(selectedAttack.severity)}18`,color:getSeverityColor(selectedAttack.severity),border:`1px solid ${getSeverityColor(selectedAttack.severity)}55`,boxShadow:`0 0 14px ${getSeverityGlow(selectedAttack.severity)}`}}>{selectedAttack.severity}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:'rgba(0,200,255,0.04)',borderRadius:'8px',border:'1px solid rgba(0,200,255,0.1)',marginBottom:'12px',fontSize:'12px'}}>
                <span style={{fontSize:'18px'}}>{selectedAttack.source.flag}</span><span style={{color:'#718096'}}>{selectedAttack.source.name}</span>
                <span style={{color:'#00c8ff',margin:'0 4px'}}>⟶</span>
                <span style={{fontSize:'18px'}}>{selectedAttack.target.flag}</span><span style={{color:'#718096'}}>{selectedAttack.target.name}</span>
                <div style={{marginLeft:'auto',display:'flex',gap:'6px'}}><Chip label={selectedAttack.sector} color="#7b2dff"/><Chip label={selectedAttack.protocol} color="#00c8ff"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'12px'}}>
                <MiniStat label="Affected" value={`~${selectedAttack.affected.toLocaleString()}`}/><MiniStat label="Port" value={selectedAttack.port}/><MiniStat label="Time" value={selectedAttack.timestamp.toLocaleTimeString()}/>
              </div>
              <div style={{display:'flex',gap:'1px',overflowX:'auto'}}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:'none',padding:'9px 12px',background:activeTab===t.id?'rgba(0,200,255,0.08)':'transparent',border:'none',borderBottom:activeTab===t.id?'2px solid #00c8ff':'2px solid transparent',color:activeTab===t.id?'#00c8ff':'#4a5568',fontSize:'10px',fontFamily:"'Share Tech Mono',monospace",cursor:'pointer',transition:'all 0.2s',whiteSpace:'nowrap'}}>
                    {t.icon} {t.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
              {activeTab==='overview'&&(
                <div>
                  <SectionLabel>WHAT IS THIS ATTACK?</SectionLabel>
                  <div style={{display:'flex',gap:'5px',marginBottom:'12px'}}>
                    {['beginner','intermediate','expert'].map(m=>(
                      <button key={m} onClick={()=>setLearningMode(m)} style={{flex:1,padding:'7px 4px',borderRadius:'6px',fontSize:'9px',fontFamily:'Orbitron',letterSpacing:'0.5px',textTransform:'uppercase',cursor:'pointer',transition:'all 0.2s',background:learningMode===m?'rgba(0,200,255,0.12)':'transparent',border:learningMode===m?'1px solid #00c8ff':'1px solid rgba(0,200,255,0.2)',color:learningMode===m?'#00c8ff':'#4a5568'}}>{m}</button>
                    ))}
                  </div>
                  <div style={{padding:'14px 16px',lineHeight:1.9,fontSize:'13px',color:'#a0aec0',background:'rgba(0,200,255,0.03)',borderLeft:`3px solid ${getSeverityColor(selectedAttack.severity)}`,borderRadius:'8px',marginBottom:'18px'}}>
                    {OVERVIEW_TEXT[learningMode][selectedAttack.attackType]}
                  </div>
                  <SectionLabel>ATTACK METADATA</SectionLabel>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px'}}>
                    {[['Source',`${selectedAttack.source.flag} ${selectedAttack.source.name}`],['Target',`${selectedAttack.target.flag} ${selectedAttack.target.name}`],['Sector',selectedAttack.sector],['Protocol',selectedAttack.protocol],['Port',selectedAttack.port],['Affected',`~${selectedAttack.affected.toLocaleString()}`]].map(([k,v])=>(
                      <div key={k} style={{padding:'9px 11px',background:'rgba(0,200,255,0.04)',border:'1px solid rgba(0,200,255,0.1)',borderRadius:'7px'}}>
                        <div style={{color:'#4a5568',fontSize:'9px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>{k}</div>
                        <div style={{color:'#e2e8f0',fontSize:'12px'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab==='killchain'&&(
                <div>
                  <SectionLabel>ATTACK KILL CHAIN</SectionLabel>
                  <p style={{color:'#4a5568',fontSize:'11px',marginBottom:'18px',lineHeight:1.7}}>Each phase represents a step the attacker must complete. Defenders who understand every phase can interrupt the attack before it reaches the end.</p>
                  <div style={{position:'relative'}}>
                    {info.killChain.map((step,i)=>(
                      <div key={i} style={{display:'flex',gap:'14px',marginBottom:'4px',position:'relative'}}>
                        {i<info.killChain.length-1&&<div style={{position:'absolute',left:'17px',top:'36px',width:'2px',height:'calc(100% + 4px)',background:'linear-gradient(180deg,rgba(0,200,255,0.35),rgba(0,200,255,0.04))',zIndex:0}}/>}
                        <div style={{flexShrink:0,width:'34px',height:'34px',borderRadius:'50%',background:i===info.killChain.length-1?'rgba(255,45,85,0.2)':'rgba(0,200,255,0.1)',border:`2px solid ${i===info.killChain.length-1?'#ff2d55':'rgba(0,200,255,0.4)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',zIndex:1}}>{step.icon}</div>
                        <div style={{flex:1,padding:'9px 13px',background:i===info.killChain.length-1?'rgba(255,45,85,0.06)':'rgba(0,200,255,0.04)',border:`1px solid ${i===info.killChain.length-1?'rgba(255,45,85,0.25)':'rgba(0,200,255,0.1)'}`,borderRadius:'8px',marginBottom:'8px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}><span style={{fontFamily:'Orbitron',fontSize:'9px',color:i===info.killChain.length-1?'#ff2d55':'#00c8ff'}}>PHASE {i+1}</span><span style={{color:'#e2e8f0',fontSize:'12px',fontWeight:700}}>{step.phase}</span></div>
                          <p style={{color:'#718096',fontSize:'12px',margin:0,lineHeight:1.7}}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab==='mitre'&&(
                <div>
                  <SectionLabel>MITRE ATT&CK FRAMEWORK</SectionLabel>
                  <p style={{color:'#4a5568',fontSize:'11px',marginBottom:'18px',lineHeight:1.7}}>MITRE ATT&CK is a globally-used knowledge base of real-world adversary tactics and techniques used to classify attacks and build detections.</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'20px'}}>
                    <MitreCard label="TACTIC" id={info.mitre.tacticId} name={info.mitre.tactic} desc="The adversary's high-level goal — what they are ultimately trying to achieve" color="#7b2dff"/>
                    <div style={{display:'flex',justifyContent:'center'}}><div style={{width:2,height:16,background:'linear-gradient(180deg,#7b2dff,#00c8ff)'}}/></div>
                    <MitreCard label="TECHNIQUE" id={info.mitre.techniqueId} name={info.mitre.technique} desc="The specific method the attacker uses to achieve the tactic" color="#00c8ff"/>
                    {info.mitre.subId!==info.mitre.techniqueId&&<><div style={{display:'flex',justifyContent:'center'}}><div style={{width:2,height:16,background:'linear-gradient(180deg,#00c8ff,#30d158)'}}/></div><MitreCard label="SUB-TECHNIQUE" id={info.mitre.subId} name={info.mitre.subTechnique} desc="A more specific implementation of the parent technique" color="#30d158"/></>}
                  </div>
                  <a href={info.mitre.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 14px',background:'rgba(0,200,255,0.06)',border:'1px solid rgba(0,200,255,0.25)',borderRadius:'8px',color:'#00c8ff',textDecoration:'none',fontSize:'12px',transition:'all 0.2s',marginBottom:'16px'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.14)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.06)';}}>
                    🔗 View {info.mitre.techniqueId} on MITRE ATT&CK →
                  </a>
                </div>
              )}
              {activeTab==='examples'&&(
                <div>
                  <SectionLabel>REAL-WORLD INCIDENTS</SectionLabel>
                  <p style={{color:'#4a5568',fontSize:'11px',marginBottom:'18px',lineHeight:1.7}}>Documented real attacks using this exact technique.</p>
                  {info.realWorld.map((ex,i)=>(
                    <div key={i} style={{padding:'15px',background:'rgba(0,200,255,0.03)',border:'1px solid rgba(0,200,255,0.1)',borderRadius:'10px',marginBottom:'12px',position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,${getSeverityColor(selectedAttack.severity)},transparent)`}}/>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'9px'}}>
                        <div style={{fontFamily:'Orbitron',fontSize:'12px',color:'#f0f4ff',fontWeight:700}}>{ex.name}</div>
                        <span style={{flexShrink:0,padding:'3px 9px',borderRadius:'12px',fontSize:'9px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',background:`${getBadgeColor(ex.badge)}22`,color:getBadgeColor(ex.badge),border:`1px solid ${getBadgeColor(ex.badge)}44`}}>{ex.badge}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'7px'}}><span style={{color:'#4a5568',fontSize:'9px',textTransform:'uppercase',letterSpacing:'1px'}}>Target:</span><span style={{color:'#a0aec0',fontSize:'11px'}}>{ex.target}</span></div>
                      <p style={{color:'#718096',fontSize:'12px',margin:'0 0 9px',lineHeight:1.75}}>{ex.impact}</p>
                      <div style={{padding:'7px 11px',background:`${getSeverityColor(selectedAttack.severity)}10`,border:`1px solid ${getSeverityColor(selectedAttack.severity)}30`,borderRadius:'6px',display:'flex',alignItems:'center',gap:'7px'}}>
                        <span>📊</span><span style={{color:getSeverityColor(selectedAttack.severity),fontSize:'11px',fontWeight:700}}>{ex.scale}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab==='defend'&&(
                <div>
                  <SectionLabel>DEFENCE & MITIGATION</SectionLabel>
                  <div style={{display:'flex',gap:'5px',marginBottom:'18px'}}>
                    {['beginner','intermediate','expert'].map(m=>(
                      <button key={m} onClick={()=>setLearningMode(m)} style={{flex:1,padding:'7px 4px',borderRadius:'6px',fontSize:'9px',fontFamily:'Orbitron',letterSpacing:'0.5px',textTransform:'uppercase',cursor:'pointer',transition:'all 0.2s',background:learningMode===m?'rgba(48,209,88,0.12)':'transparent',border:learningMode===m?'1px solid #30d158':'1px solid rgba(0,200,255,0.2)',color:learningMode===m?'#30d158':'#4a5568'}}>{m}</button>
                    ))}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'18px'}}>
                    {info.mitigations[learningMode].map((step,i)=>(
                      <div key={i} style={{display:'flex',gap:'11px',padding:'11px 13px',background:'rgba(48,209,88,0.04)',border:'1px solid rgba(48,209,88,0.14)',borderRadius:'8px',alignItems:'flex-start'}}>
                        <div style={{flexShrink:0,width:'22px',height:'22px',borderRadius:'50%',background:'rgba(48,209,88,0.15)',border:'1px solid rgba(48,209,88,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#30d158',fontFamily:'Orbitron',fontWeight:700}}>{i+1}</div>
                        <p style={{color:'#a0aec0',fontSize:'12px',margin:0,lineHeight:1.8}}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'13px 15px',background:'rgba(255,214,10,0.04)',border:'1px solid rgba(255,214,10,0.18)',borderRadius:'8px'}}>
                    <div style={{fontFamily:'Orbitron',fontSize:'9px',color:'#ffd60a',letterSpacing:'1.5px',marginBottom:'7px'}}>⚡ KEY PRINCIPLE</div>
                    <p style={{color:'#718096',fontSize:'12px',margin:0,lineHeight:1.8}}>No single control is sufficient. Patch management, MFA, and backups alone stop the vast majority of attacks.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <style jsx global>{`
          * { box-sizing: border-box; } body { margin: 0; }
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.25); border-radius: 2px; }
          @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.15;} }
          @keyframes slideIn { from{opacity:0;transform:translateX(-12px);} to{opacity:1;transform:translateX(0);} }
          @keyframes slideInRight { from{transform:translateX(100%);} to{transform:translateX(0);} }
          .mapboxgl-ctrl-bottom-right,.mapboxgl-ctrl-bottom-left{display:none!important;}
        `}</style>
      </div>
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function StatBadge({label,value,color}){return(<div><div style={{color:'#4a5568',fontSize:'9px',textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'2px'}}>{label}</div><div style={{color,fontFamily:'Orbitron',fontSize:'17px',fontWeight:700,textShadow:`0 0 18px ${color}55`}}>{value}</div></div>);}
function HdrBtn({children,active,onClick,color}){return(<button onClick={onClick} style={{padding:'6px 12px',borderRadius:'20px',background:active?`${color}18`:'rgba(0,0,0,0.1)',border:`1px solid ${active?color+'55':'rgba(255,255,255,0.08)'}`,color:active?color:'#4a5568',fontSize:'10px',cursor:'pointer',transition:'all 0.25s',fontFamily:"'Share Tech Mono',monospace",letterSpacing:'0.5px'}}>{children}</button>);}
function SectionLabel({children}){return<div style={{fontFamily:'Orbitron',fontSize:'10px',color:'#00c8ff',letterSpacing:'2px',marginBottom:'13px',paddingBottom:'7px',borderBottom:'1px solid rgba(0,200,255,0.1)'}}>{children}</div>;}
function MiniStat({label,value}){return(<div style={{padding:'7px 9px',background:'rgba(0,200,255,0.04)',border:'1px solid rgba(0,200,255,0.1)',borderRadius:'6px',textAlign:'center'}}><div style={{color:'#4a5568',fontSize:'9px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>{label}</div><div style={{color:'#e2e8f0',fontSize:'11px'}}>{value}</div></div>);}
function Chip({label,color}){return<span style={{padding:'3px 7px',borderRadius:'4px',fontSize:'9px',background:`${color}18`,color,border:`1px solid ${color}44`,letterSpacing:'0.5px'}}>{label}</span>;}
function MitreCard({label,id,name,desc,color}){return(<div style={{padding:'12px 14px',background:`${color}08`,border:`1px solid ${color}28`,borderRadius:'9px'}}><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px',flexWrap:'wrap'}}><span style={{padding:'2px 7px',borderRadius:'4px',fontSize:'9px',fontFamily:'Orbitron',letterSpacing:'1px',background:`${color}20`,color,border:`1px solid ${color}50`}}>{label}</span><span style={{color,fontSize:'11px',fontFamily:'Orbitron',fontWeight:700}}>{id}</span><span style={{color:'#e2e8f0',fontSize:'12px',fontWeight:700}}>{name}</span></div><p style={{color:'#718096',fontSize:'11px',margin:0,lineHeight:1.7}}>{desc}</p></div>);}
function Placeholder(){return<div style={{color:'#4a5568',fontSize:'11px',textAlign:'center',padding:'14px 0'}}>Waiting for data...</div>;}
