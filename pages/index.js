import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

// ─── ATTACK KNOWLEDGE BASE ───────────────────────────────────────────────────
const ATTACK_DATA = {
  'DDoS': {
    icon: '🌊',
    fullName: 'Distributed Denial of Service',
    mitre: {
      tactic: 'Impact', tacticId: 'TA0040',
      technique: 'Network Denial of Service', techniqueId: 'T1498',
      subTechnique: 'Direct Network Flood', subId: 'T1498.001',
      url: 'https://attack.mitre.org/techniques/T1498/'
    },
    killChain: [
      { phase: 'Reconnaissance', desc: 'Attacker scans for vulnerable IoT devices and servers to recruit into a botnet', icon: '🔍' },
      { phase: 'Weaponize', desc: 'Botnet C2 infrastructure set up; attack scripts deployed to infected nodes globally', icon: '⚙️' },
      { phase: 'Delivery', desc: 'Command sent to 10,000+ bots to simultaneously flood target with traffic', icon: '📡' },
      { phase: 'Exploitation', desc: "Target's bandwidth saturated; legitimate requests cannot be processed", icon: '💥' },
      { phase: 'Impact', desc: 'Service goes offline; revenue loss and reputational damage to victim organization', icon: '🔴' }
    ],
    realWorld: [
      { name: 'Mirai Botnet (2016)', target: 'Dyn DNS Provider', impact: 'Took down Twitter, Netflix, Reddit, and GitHub for hours across the US East Coast', scale: '1.2 Tbps — largest recorded DDoS at the time', badge: 'Historic' },
      { name: 'GitHub Attack (2018)', target: 'GitHub.com', impact: 'Largest DDoS ever recorded at the time; GitHub was offline for ~10 minutes', scale: '1.35 Tbps via Memcached amplification', badge: 'Record' },
      { name: 'Google Cloud (2023)', target: 'Google infrastructure', impact: 'HTTP/2 Rapid Reset attack — 398 million requests per second peak', scale: '7.5× larger than any previous attack on record', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['Use a CDN like Cloudflare which absorbs attack traffic before it reaches your site', 'Enable DDoS protection offered by your hosting or cloud provider', 'Have a backup plan ready in case your website goes down temporarily'],
      intermediate: ['Implement rate limiting and IP reputation filtering at your edge', 'Use Anycast network diffusion to spread traffic across many data centres', 'Configure SYN cookies to handle TCP flood attacks on your servers', 'Set up traffic scrubbing services from providers like Akamai or Cloudflare'],
      expert: ['Deploy BGP blackhole routing for upstream filtering at the ISP level', 'Implement RTBH (Remotely Triggered Black Hole) routing with your upstream provider', 'Use flowspec rules to drop malicious traffic patterns at the router level', 'Deploy stateless ACLs at peering points — MITRE D3FEND: Network Traffic Filtering']
    }
  },
  'Malware': {
    icon: '🦠',
    fullName: 'Malicious Software Infection',
    mitre: {
      tactic: 'Execution', tacticId: 'TA0002',
      technique: 'User Execution', techniqueId: 'T1204',
      subTechnique: 'Malicious File', subId: 'T1204.002',
      url: 'https://attack.mitre.org/techniques/T1204/'
    },
    killChain: [
      { phase: 'Reconnaissance', desc: 'Attacker identifies targets via social media, LinkedIn profiles, or purchased contact lists', icon: '🔍' },
      { phase: 'Weaponize', desc: 'Malicious payload packaged inside an Office doc, PDF, or fake software installer', icon: '⚙️' },
      { phase: 'Delivery', desc: 'Payload sent via phishing email, malicious download link, or infected USB drive', icon: '📧' },
      { phase: 'Exploitation', desc: 'Victim opens the file; macro or exploit executes malware silently in the background', icon: '💥' },
      { phase: 'Persistence', desc: 'Malware adds registry keys or scheduled tasks to survive system reboots', icon: '🔗' },
      { phase: 'C2 & Exfil', desc: 'Malware calls home to attacker C2 server; data is stolen or ransomware is deployed', icon: '🔴' }
    ],
    realWorld: [
      { name: 'Emotet (2014–2021)', target: 'Global — banks, hospitals, governments', impact: 'Most dangerous malware of the decade; delivered ransomware payloads to thousands of organisations', scale: '$2.5B+ in damages globally over its lifetime', badge: 'Historic' },
      { name: 'NotPetya (2017)', target: 'Ukraine → Global supply chains', impact: 'Disguised as ransomware but was actually a wiper — permanently destroyed data with no recovery path', scale: '$10B+ in damages; Maersk alone lost $300M', badge: 'Nation-State' },
      { name: 'XZ Utils Backdoor (2024)', target: 'Linux systems worldwide', impact: 'Supply chain backdoor hidden inside a widely-used compression library for over two years undetected', scale: 'Would have affected millions of servers globally if not caught by one engineer', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['Never open email attachments from unknown or unexpected senders', 'Keep your antivirus and operating system up to date at all times', 'Only download software from official, trusted websites and app stores', 'Enable automatic OS updates so security patches are installed promptly'],
      intermediate: ['Deploy EDR (Endpoint Detection & Response) solutions on all company endpoints', 'Implement application allowlisting to block unknown or unsigned executables', 'Disable Office macros globally via Group Policy — enable only where strictly required', 'Use network segmentation to limit how far an infection can spread laterally'],
      expert: ['Deploy behavioural analysis EDR such as CrowdStrike Falcon or SentinelOne', 'Write and maintain YARA rules for IOC-based detection across your environment', 'Deploy deception technology (honeypots, canary tokens) for early-stage detection', 'Apply MITRE D3FEND: Executable Allowlisting combined with Dynamic Analysis sandboxing']
    }
  },
  'Phishing': {
    icon: '🎣',
    fullName: 'Phishing / Social Engineering',
    mitre: {
      tactic: 'Initial Access', tacticId: 'TA0001',
      technique: 'Phishing', techniqueId: 'T1566',
      subTechnique: 'Spearphishing Attachment', subId: 'T1566.001',
      url: 'https://attack.mitre.org/techniques/T1566/'
    },
    killChain: [
      { phase: 'Reconnaissance', desc: "Attacker researches the target extensively via LinkedIn, company website, and social media", icon: '🔍' },
      { phase: 'Weaponize', desc: 'Fake email crafted to mimic a trusted sender — CEO, bank, IT help desk, or vendor', icon: '✉️' },
      { phase: 'Delivery', desc: 'Email sent with a malicious link or attachment; urgency and fear tactics pressure victim to act', icon: '📧' },
      { phase: 'Exploitation', desc: 'Victim clicks link → redirected to a convincing fake login page that harvests credentials', icon: '💥' },
      { phase: 'Lateral Movement', desc: 'Stolen credentials used to access email, VPN, internal systems, and cloud services', icon: '🔗' },
      { phase: 'Impact', desc: 'Data is exfiltrated, accounts are taken over, or malware is quietly deployed inside the network', icon: '🔴' }
    ],
    realWorld: [
      { name: 'Twitter Hack (2020)', target: 'Twitter employees', impact: 'High-profile accounts (Obama, Musk, Gates) hijacked via phone-based phishing of Twitter support staff', scale: 'Bitcoin scam netted $120K; massive reputational damage to Twitter', badge: 'High-Profile' },
      { name: 'Ubiquiti BEC (2015)', target: 'Ubiquiti Networks finance team', impact: "Employee phished into wiring $46.7M to attacker's overseas accounts in a Business Email Compromise", scale: '$46.7M stolen — never fully recovered', badge: 'Financial' },
      { name: 'MGM Resorts (2023)', target: 'MGM IT Help Desk', impact: 'Attackers called the IT help desk pretending to be an employee; gained full network access within minutes', scale: '$100M+ in losses; casino systems were offline for days', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['Always check the sender email address carefully — not just the display name shown', "If an email urgently asks for your password or payment, it's almost certainly fake", 'Enable two-factor authentication (2FA) on every important account you own', 'When in doubt, call the sender directly on a phone number you already know'],
      intermediate: ['Implement DMARC, DKIM, and SPF email authentication records on your domain', 'Deploy an email security gateway such as Proofpoint or Mimecast', 'Run regular phishing simulation training campaigns for all staff members', 'Use hardware MFA tokens (YubiKey) rather than SMS-based 2FA wherever possible'],
      expert: ['Deploy AiTM-resistant FIDO2 / passkey authentication across your organisation', 'Implement Zero Trust Network Access — remove implicit trust from VPN connections', 'Configure Conditional Access Policies tied to device health and compliance state', 'Monitor for impossible travel events and new device logins as anomaly signals']
    }
  },
  'Ransomware': {
    icon: '🔒',
    fullName: 'Ransomware Encryption Attack',
    mitre: {
      tactic: 'Impact', tacticId: 'TA0040',
      technique: 'Data Encrypted for Impact', techniqueId: 'T1486',
      subTechnique: 'N/A — top-level technique', subId: 'T1486',
      url: 'https://attack.mitre.org/techniques/T1486/'
    },
    killChain: [
      { phase: 'Initial Access', desc: 'Entry via phishing email, RDP brute force, or exploitation of an unpatched vulnerability', icon: '🚪' },
      { phase: 'Persistence', desc: 'Backdoor installed; attacker lurks quietly for days or weeks to map the full network', icon: '🔗' },
      { phase: 'Reconnaissance', desc: 'Internal network mapped; valuable data, domain admin accounts, and backup systems located', icon: '🔍' },
      { phase: 'Exfiltration', desc: "Sensitive data copied to attacker's servers — leverage for double extortion demands", icon: '📤' },
      { phase: 'Weaponize', desc: 'Ransomware binary deployed simultaneously to all reachable machines on the network', icon: '⚙️' },
      { phase: 'Encryption', desc: 'All files encrypted with AES-256 + RSA-4096; ransom note dropped on every machine', icon: '🔴' }
    ],
    realWorld: [
      { name: 'WannaCry (2017)', target: 'NHS UK, FedEx, Deutsche Bahn, 150+ countries', impact: 'Exploited the EternalBlue NSA exploit; UK hospitals turned away patients and cancelled surgeries', scale: '$4B+ in damages; 300,000 machines across 150 countries encrypted', badge: 'Historic' },
      { name: 'Colonial Pipeline (2021)', target: 'US fuel pipeline infrastructure', impact: 'DarkSide ransomware shut down 45% of the US East Coast fuel supply for 6 consecutive days', scale: '$4.4M ransom paid; national emergency declared by US President Biden', badge: 'Critical Infra' },
      { name: 'Change Healthcare (2024)', target: 'US healthcare payment systems', impact: 'Largest healthcare data breach in US history; prescription processing delayed nationwide for weeks', scale: '$22M ransom paid; 100M+ patient records exposed across the US', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['Keep regular backups stored on a separate drive or service not connected to your computer', "Never pay the ransom — it encourages more attacks and doesn't guarantee you get your files back", 'Keep all software and operating systems updated with the latest security patches', 'Be very careful opening email attachments, especially from unexpected senders'],
      intermediate: ['Implement the 3-2-1 backup rule: 3 copies, on 2 different media types, with 1 stored offsite', 'Disable RDP if not needed; where required, use VPN with MFA and restrict source IPs', 'Segment your network into zones so ransomware cannot spread freely across all systems', 'Deploy Privileged Access Management (PAM) to limit the blast radius of any compromised account'],
      expert: ['Implement immutable backups with WORM (Write Once Read Many) storage that cannot be deleted', 'Deploy canary files and honeypot SMB shares to detect file encryption activity in real-time', 'Use deception technology to detect lateral movement weeks before ransomware detonates', 'Apply MITRE D3FEND: Credential Hardening + Process Spawn Analysis for early behavioural detection']
    }
  },
  'Data Breach': {
    icon: '🗄️',
    fullName: 'Data Exfiltration / Breach',
    mitre: {
      tactic: 'Exfiltration', tacticId: 'TA0010',
      technique: 'Exfiltration Over C2 Channel', techniqueId: 'T1041',
      subTechnique: 'Automated Exfiltration', subId: 'T1020',
      url: 'https://attack.mitre.org/techniques/T1041/'
    },
    killChain: [
      { phase: 'Initial Access', desc: 'Attacker gains a foothold via credential theft, SQL injection, or a malicious insider', icon: '🚪' },
      { phase: 'Discovery', desc: 'Database schemas are enumerated; sensitive tables identified — PII, financial, medical records', icon: '🔍' },
      { phase: 'Collection', desc: 'Data queried in bulk and staged locally in compressed, password-protected archives', icon: '📦' },
      { phase: 'Exfiltration', desc: 'Archives sent out via HTTPS, DNS tunneling, or legitimate cloud storage APIs to avoid detection', icon: '📤' },
      { phase: 'Monetization', desc: 'Stolen data sold on dark web marketplaces, used for identity theft, or held for ransom', icon: '🔴' }
    ],
    realWorld: [
      { name: 'Yahoo Breach (2013–2014)', target: 'Yahoo user database', impact: 'All 3 billion Yahoo accounts compromised over two incidents; not disclosed publicly until 2016', scale: '3 billion accounts — the largest data breach in history by volume', badge: 'Historic' },
      { name: 'Equifax (2017)', target: 'Equifax credit bureau', impact: 'SSNs, dates of birth, and addresses of 147 million Americans exposed via an unpatched Apache Struts server', scale: '$700M settlement reached; CEO resigned within weeks of disclosure', badge: 'Critical' },
      { name: 'National Public Data (2024)', target: 'US background check company', impact: 'SSNs, addresses, and family member data of nearly every American adult exposed in a single breach', scale: '2.9 billion records leaked; company subsequently filed for bankruptcy', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['Use a unique, strong password for every website — a password manager makes this easy', 'Check haveibeenpwned.com to see if your email has appeared in known data breaches', 'Set up credit monitoring alerts to catch fraudulent accounts opened in your name', 'Use virtual card numbers for online shopping to limit exposure of your real card details'],
      intermediate: ['Encrypt all sensitive data at rest using AES-256 with properly managed encryption keys', 'Implement Data Loss Prevention (DLP) tools to detect and block unauthorised data transfers', 'Apply the principle of least privilege — staff should only access data their role requires', 'Monitor database query patterns to detect anomalous bulk exports or off-hours access'],
      expert: ['Implement column-level encryption for PII fields directly within your database schema', 'Deploy Database Activity Monitoring (DAM) with ML-based behavioural baselines per user', 'Use tokenization for payment card data to dramatically reduce your PCI-DSS compliance scope', 'Apply data masking in all non-production environments — MITRE D3FEND: Data Encryption']
    }
  },
  'SQL Injection': {
    icon: '💉',
    fullName: 'SQL Injection Attack',
    mitre: {
      tactic: 'Initial Access', tacticId: 'TA0001',
      technique: 'Exploit Public-Facing Application', techniqueId: 'T1190',
      subTechnique: 'N/A — top-level technique', subId: 'T1190',
      url: 'https://attack.mitre.org/techniques/T1190/'
    },
    killChain: [
      { phase: 'Reconnaissance', desc: 'Attacker probes web forms, URL parameters, and API endpoints for injection vulnerabilities', icon: '🔍' },
      { phase: 'Testing', desc: "Basic payloads like ' OR 1=1-- injected to confirm whether input reaches the database unsanitised", icon: '🧪' },
      { phase: 'Exploitation', desc: 'Union-based or blind SQL injection used to extract full database schema and sensitive table contents', icon: '💥' },
      { phase: 'Escalation', desc: 'Admin credentials extracted; attacker may escalate to execute operating system commands', icon: '⬆️' },
      { phase: 'Impact', desc: 'Data dumped and exfiltrated, application defaced, or OS commands executed via xp_cmdshell', icon: '🔴' }
    ],
    realWorld: [
      { name: 'Heartland Payments (2008)', target: 'Heartland Payment Systems', impact: 'SQL injection used to install spyware on the payment processing network; 130 million cards stolen', scale: '$140M in fines and settlements; CEO later convicted', badge: 'Historic' },
      { name: 'Sony PSN (2011)', target: 'Sony PlayStation Network', impact: "LulzSec used basic SQL injection on Sony's website; 77 million PSN accounts were compromised", scale: '77M accounts exposed; PlayStation Network offline for 23 days', badge: 'High-Profile' },
      { name: 'MOVEit Transfer (2023)', target: '2,000+ organisations globally', impact: 'SQL injection zero-day in MOVEit file transfer software; exploited by Cl0p ransomware group at mass scale', scale: '62M individuals affected across NHS, Shell, US government agencies', badge: 'Recent' }
    ],
    mitigations: {
      beginner: ['SQL Injection happens because websites trust user input without checking it — this is a developer responsibility', 'As a user: look for signs a site is well-maintained and report suspicious form behaviour to the company', 'Avoid reusing passwords — if one site is breached via SQLi, your credentials are exposed on others'],
      intermediate: ['Use parameterised queries or prepared statements everywhere — this is the single most effective fix', 'Deploy a Web Application Firewall (WAF) such as ModSecurity with the OWASP Core Rule Set', 'Implement strict input validation and output encoding on every user-facing field in your application', 'Run OWASP ZAP or Burp Suite automated scans on your applications as part of your CI/CD pipeline'],
      expert: ['Use ORM frameworks that enforce parameterisation by default (e.g., SQLAlchemy, Hibernate, ActiveRecord)', 'Implement stored procedures with a minimal-privilege dedicated database account for the application', 'Deploy Runtime Application Self-Protection (RASP) for real-time in-process attack blocking', 'Apply MITRE D3FEND: Input Validation + Application Configuration Hardening + Database Query Allowlisting']
    }
  }
};

const getSeverityColor = (s) => ({ critical:'#ff2d55', high:'#ff6b35', medium:'#ffd60a', low:'#30d158' }[s] || '#00c8ff');
const getSeverityGlow = (s) => ({ critical:'rgba(255,45,85,0.6)', high:'rgba(255,107,53,0.6)', medium:'rgba(255,214,10,0.6)', low:'rgba(48,209,88,0.6)' }[s] || 'rgba(0,200,255,0.4)');
const getBadgeColor = (b) => ({ Historic:'#7b2dff', Record:'#ff2d55', Recent:'#00c8ff', 'Nation-State':'#ff2d55', Financial:'#ffd60a', Critical:'#ff2d55', 'Critical Infra':'#ff6b35', 'High-Profile':'#a855f7' }[b] || '#4a5568');

const OVERVIEW_TEXT = {
  beginner: {
    DDoS: "A DDoS attack is like thousands of people calling a restaurant at the same time so real customers can't get through. Hackers use infected computers to flood a website with fake traffic until it crashes.",
    Malware: "Malware is malicious software secretly installed on your device to steal data, spy on you, or damage your system. Think of it as a digital burglar hiding inside your computer.",
    Phishing: "Phishing is when attackers disguise themselves as trustworthy sources — like your bank or your boss — to trick you into handing over passwords or clicking dangerous links.",
    Ransomware: "Ransomware is like a digital kidnapper. It locks all your files with unbreakable encryption and demands you pay money to unlock them. Even paying often doesn't guarantee recovery.",
    'Data Breach': "A data breach is when hackers break into a company's database and steal personal information — like passwords, credit cards, and social security numbers — then often sell it on the dark web.",
    'SQL Injection': "SQL Injection is a trick where hackers type special code into a website's search box or form to fool the database into handing over secret information it was never meant to share."
  },
  intermediate: {
    DDoS: "This DDoS attack leverages a botnet to generate volumetric flood traffic — typically HTTP or UDP — overwhelming the target's upstream bandwidth and preventing legitimate users from reaching the service.",
    Malware: "This malware establishes persistence via registry run keys and scheduled tasks, then communicates with C2 infrastructure over encrypted channels to receive commands and exfiltrate data over time.",
    Phishing: "This spearphishing campaign uses lookalike domains with valid SSL certificates to harvest credentials. Attackers research targets on LinkedIn to personalise lures and evade spam filters.",
    Ransomware: "This ransomware gains initial access via phishing or RDP brute force, moves laterally through the network, disables backup services, then simultaneously encrypts files across all reachable hosts.",
    'Data Breach': "This breach exploited an authenticated access path to enumerate and bulk-dump sensitive database tables. The attacker used slow, low-volume queries to stay below the threshold of security alerting.",
    'SQL Injection': "This attack uses union-based SQL injection to append queries that extract data from tables outside the intended query scope. Boolean-based blind injection is used to enumerate the full database schema."
  },
  expert: {
    DDoS: "HTTP/2 Rapid Reset or Memcached-amplified UDP flood. Attacker leverages IoT botnet (Mirai variant) for 300Gbps+ volumetric attack. MITRE T1498.001. Mitigate via BGP flowspec, upstream scrubbing centres, and SYN cookies.",
    Malware: "APT implant using process hollowing (T1055.012) and DLL side-loading (T1574.002). C2 via DNS-over-HTTPS (T1071.004). Persistence via COM hijacking (T1546.015). Detection: YARA rules on PE headers and beacon timing analysis.",
    Phishing: "AiTM reverse proxy attack using Evilginx2 framework targeting TOTP-based MFA (T1539). Session cookie theft bypasses 2FA entirely. Mitigate with FIDO2 hardware keys, Conditional Access with device compliance, and EAP-TLS.",
    Ransomware: "LockBit 3.0 / BlackCat affiliate model. ChaCha20 file encryption + RSA-4096 key wrapping. Double extortion via data leak site. Initial access likely CVE-2023-3519 (Citrix Bleed). Remediate: WORM backups, PAM, LAPS rotation.",
    'Data Breach': "Second-order SQL injection triggering stored payloads on retrieval. OOB exfiltration via DNS (T1048.003) to evade egress filtering. Mitigate: stored procedures, DAM with ML baseline, column-level AES-256 encryption, query allowlisting.",
    'SQL Injection': "Polyglot SQLi payloads designed to bypass WAF signature sets. Stacked queries used for RCE via xp_cmdshell (MSSQL) or UDF injection (MySQL). MITRE T1190. Remediation: parameterised queries, RASP, DAM, least-privilege DB accounts."
  }
};

export default function Home() {
  const [attacks, setAttacks] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [stats, setStats] = useState({ attacksToday: 45234, attacksActive: 0 });
  const [learningMode, setLearningMode] = useState('beginner');
  const [activeTab, setActiveTab] = useState('overview');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const attackLayersRef = useRef([]);
  const spinRef = useRef(null);
  const userInteractingRef = useRef(false);

  const attackTypes = ['DDoS', 'Malware', 'Phishing', 'Ransomware', 'Data Breach', 'SQL Injection'];
  const severities = ['critical', 'high', 'medium', 'low'];
  const countries = [
    { name: 'United States', code: 'US', flag: '🇺🇸', coords: [-95.7129, 37.0902] },
    { name: 'Russia', code: 'RU', flag: '🇷🇺', coords: [105.3188, 61.5240] },
    { name: 'China', code: 'CN', flag: '🇨🇳', coords: [104.1954, 35.8617] },
    { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', coords: [-3.4360, 55.3781] },
    { name: 'Germany', code: 'DE', flag: '🇩🇪', coords: [10.4515, 51.1657] },
    { name: 'India', code: 'IN', flag: '🇮🇳', coords: [78.9629, 20.5937] },
    { name: 'Brazil', code: 'BR', flag: '🇧🇷', coords: [-51.9253, -14.2350] },
    { name: 'Japan', code: 'JP', flag: '🇯🇵', coords: [138.2529, 36.2048] },
    { name: 'France', code: 'FR', flag: '🇫🇷', coords: [2.2137, 46.2276] },
    { name: 'Australia', code: 'AU', flag: '🇦🇺', coords: [133.7751, -25.2744] },
    { name: 'Canada', code: 'CA', flag: '🇨🇦', coords: [-106.3468, 56.1304] },
    { name: 'South Korea', code: 'KR', flag: '🇰🇷', coords: [127.7669, 35.9078] },
    { name: 'Netherlands', code: 'NL', flag: '🇳🇱', coords: [5.2913, 52.1326] },
    { name: 'Singapore', code: 'SG', flag: '🇸🇬', coords: [103.8198, 1.3521] },
    { name: 'South Africa', code: 'ZA', flag: '🇿🇦', coords: [22.9375, -30.5595] }
  ];

  const createBezierArc = (start, end, steps = 80) => {
    const coords = [];
    const midLng = (start[0] + end[0]) / 2;
    const midLat = (start[1] + end[1]) / 2 + Math.abs(end[0] - start[0]) * 0.25;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, mt = 1 - t;
      coords.push([mt*mt*start[0]+2*mt*t*midLng+t*t*end[0], mt*mt*start[1]+2*mt*t*midLat+t*t*end[1]]);
    }
    return coords;
  };

  const addAttackToMap = (attack) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    while (attackLayersRef.current.length >= 15) {
      const old = attackLayersRef.current.shift();
      ['glowId','lineId','dotId','pulseId'].forEach(k => {
        if (old[k]) { if (map.getLayer(old[k])) map.removeLayer(old[k]); if (map.getSource(old[k])) map.removeSource(old[k]); }
      });
    }
    const uid = `${attack.id}-${Date.now()}`;
    const lineId=`line-${uid}`, glowId=`glow-${uid}`, dotId=`dot-${uid}`, pulseId=`pulse-${uid}`;
    const color = getSeverityColor(attack.severity);
    const fullArc = createBezierArc(attack.source.coords, attack.target.coords);

    map.addSource(glowId, { type:'geojson', data:{type:'Feature',geometry:{type:'LineString',coordinates:[attack.source.coords]}} });
    map.addLayer({ id:glowId, type:'line', source:glowId, paint:{'line-color':color,'line-width':8,'line-opacity':0.25,'line-blur':6} });
    map.addSource(lineId, { type:'geojson', data:{type:'Feature',geometry:{type:'LineString',coordinates:[attack.source.coords]}} });
    map.addLayer({ id:lineId, type:'line', source:lineId, paint:{'line-color':color,'line-width':1.5,'line-opacity':0.95} });
    map.addSource(pulseId, { type:'geojson', data:{type:'Feature',geometry:{type:'Point',coordinates:attack.target.coords}} });
    map.addLayer({ id:pulseId, type:'circle', source:pulseId, paint:{'circle-radius':0,'circle-color':'transparent','circle-stroke-color':color,'circle-stroke-width':2,'circle-stroke-opacity':0,'circle-pitch-alignment':'map'} });
    map.addSource(dotId, { type:'geojson', data:{type:'Feature',geometry:{type:'Point',coordinates:attack.source.coords}} });
    map.addLayer({ id:dotId, type:'circle', source:dotId, paint:{'circle-radius':4,'circle-color':color,'circle-opacity':1,'circle-stroke-width':2,'circle-stroke-color':'#ffffff','circle-stroke-opacity':0.8,'circle-pitch-alignment':'map'} });

    [pulseId, dotId].forEach(id => {
      map.on('click', id, () => { setSelectedAttack(attack); setActiveTab('overview'); });
      map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
    });
    attackLayersRef.current.push({ lineId, glowId, dotId, pulseId });

    const totalSteps = fullArc.length, drawDuration = 900, startTime = performance.now();
    const animatePulse = (startT, ringIndex) => {
      const ringDuration = 1200, delay = ringIndex * 400;
      const doRing = (now) => {
        const t = Math.min((now - startT - delay) / ringDuration, 1);
        if (t < 0) { requestAnimationFrame(doRing); return; }
        if (map.getLayer(pulseId)) { map.setPaintProperty(pulseId,'circle-stroke-opacity',(1-t)*0.7); map.setPaintProperty(pulseId,'circle-radius',t*28); }
        if (t < 1) requestAnimationFrame(doRing);
        else if (ringIndex < 2) animatePulse(startT, ringIndex+1);
      };
      requestAnimationFrame(doRing);
    };
    const animateDraw = (now) => {
      const progress = Math.min((now - startTime) / drawDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const visibleCoords = fullArc.slice(0, Math.max(2, Math.floor(eased * totalSteps)));
      const arcData = {type:'Feature',geometry:{type:'LineString',coordinates:visibleCoords}};
      if (map.getSource(lineId)) map.getSource(lineId).setData(arcData);
      if (map.getSource(glowId)) map.getSource(glowId).setData(arcData);
      if (map.getSource(dotId)) map.getSource(dotId).setData({type:'Feature',geometry:{type:'Point',coordinates:visibleCoords[visibleCoords.length-1]}});
      if (progress < 1) requestAnimationFrame(animateDraw);
      else {
        if (map.getSource(dotId)) map.getSource(dotId).setData({type:'Feature',geometry:{type:'Point',coordinates:attack.target.coords}});
        animatePulse(performance.now(), 0);
      }
    };
    requestAnimationFrame(animateDraw);
    setTimeout(() => {
      const fadeStart = performance.now();
      const fadeOut = (now) => {
        const t = Math.min((now - fadeStart) / 800, 1), op = 1 - t;
        if (map.getLayer(lineId)) map.setPaintProperty(lineId,'line-opacity',op*0.95);
        if (map.getLayer(glowId)) map.setPaintProperty(glowId,'line-opacity',op*0.25);
        if (map.getLayer(dotId)) map.setPaintProperty(dotId,'circle-opacity',op);
        if (t < 1) requestAnimationFrame(fadeOut);
        else {
          [glowId,lineId,dotId,pulseId].forEach(id => { if(map.getLayer(id)) map.removeLayer(id); if(map.getSource(id)) map.removeSource(id); });
          attackLayersRef.current = attackLayersRef.current.filter(l => l.lineId !== lineId);
        }
      };
      requestAnimationFrame(fadeOut);
    }, 8000);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.mapboxgl) return;
    window.mapboxgl.accessToken = 'pk.eyJ1IjoiYXllc2hhc3EiLCJhIjoiY21qNDBvOGF0MDB3ODNmcTJwbXFuaTY3eSJ9.EKiY5BPeiDF3s-tYkHGUfg';
    const map = new window.mapboxgl.Map({ container: mapRef.current, style: 'mapbox://styles/mapbox/dark-v11', projection: 'globe', zoom: 1.8, center: [15, 25], pitch: 0, antialias: true });
    map.on('load', () => {
      map.setFog({ color:'rgb(6,8,20)', 'high-color':'rgb(20,40,100)', 'horizon-blend':0.04, 'space-color':'rgb(4,4,16)', 'star-intensity':0.6 });
      const spinLoop = () => { if (!userInteractingRef.current) { const c = map.getCenter(); map.setCenter([c.lng - 0.012, c.lat]); } spinRef.current = requestAnimationFrame(spinLoop); };
      spinRef.current = requestAnimationFrame(spinLoop);
      map.on('mousedown', () => { userInteractingRef.current = true; });
      map.on('touchstart', () => { userInteractingRef.current = true; });
      map.on('mouseup', () => { userInteractingRef.current = false; });
      map.on('touchend', () => { userInteractingRef.current = false; });
      mapInstanceRef.current = map;
      setMapLoaded(true);
    });
    return () => { if (spinRef.current) cancelAnimationFrame(spinRef.current); if (mapInstanceRef.current) mapInstanceRef.current.remove(); };
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;
    const generate = () => {
      const source = countries[Math.floor(Math.random()*countries.length)];
      let target = countries[Math.floor(Math.random()*countries.length)];
      while (target.code === source.code) target = countries[Math.floor(Math.random()*countries.length)];
      return { id: Date.now()+Math.random(), timestamp: new Date(), source, target, attackType: attackTypes[Math.floor(Math.random()*attackTypes.length)], severity: severities[Math.floor(Math.random()*severities.length)], protocol: ['HTTP','TCP','UDP','ICMP'][Math.floor(Math.random()*4)], port: Math.floor(Math.random()*65535), sector: ['Financial','Healthcare','Government','Education','Retail'][Math.floor(Math.random()*5)], affected: Math.floor(Math.random()*10000)+100 };
    };
    setTimeout(() => { const a=generate(); setAttacks([a]); addAttackToMap(a); }, 100);
    setTimeout(() => { const a=generate(); setAttacks(p=>[a,...p]); addAttackToMap(a); }, 400);
    const interval = setInterval(() => {
      const a = generate();
      setAttacks(p => [a,...p].slice(0,25));
      setStats(p => ({ attacksToday: p.attacksToday+1, attacksActive: Math.floor(Math.random()*150)+50 }));
      addAttackToMap(a);
    }, 800);
    return () => clearInterval(interval);
  }, [mapLoaded]);

  const info = selectedAttack ? ATTACK_DATA[selectedAttack.attackType] : null;
  const TABS = [
    { id:'overview', label:'Overview', icon:'📊' },
    { id:'killchain', label:'Kill Chain', icon:'⛓️' },
    { id:'mitre', label:'MITRE', icon:'🎯' },
    { id:'examples', label:'Examples', icon:'📰' },
    { id:'defend', label:'Defend', icon:'🛡️' },
  ];

  return (
    <>
      <Head>
        <title>BreachMap Live — Real-Time Cyber Threat Intelligence</title>
        <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </Head>
      <Script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js" strategy="beforeInteractive" />

      <div style={{ width:'100vw', height:'100vh', overflow:'hidden', background:'#04040f', fontFamily:"'Share Tech Mono', monospace" }}>

        {/* HEADER */}
        <header style={{ position:'fixed', top:0, left:0, right:0, height:'68px', background:'linear-gradient(180deg,rgba(4,4,15,0.97) 0%,rgba(4,4,15,0.75) 100%)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(0,200,255,0.15)', display:'flex', alignItems:'center', padding:'0 32px', zIndex:100, gap:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'linear-gradient(135deg,#00c8ff,#7b2dff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', boxShadow:'0 0 20px rgba(0,200,255,0.5)' }}>⚡</div>
            <h1 style={{ fontFamily:'Orbitron', fontSize:'20px', fontWeight:900, margin:0, background:'linear-gradient(135deg,#00c8ff 0%,#7b2dff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'3px' }}>BREACHMAP LIVE</h1>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:'32px', alignItems:'center' }}>
            <StatBadge label="Attacks Today" value={stats.attacksToday.toLocaleString()} color="#00c8ff" />
            <StatBadge label="Active Now" value={stats.attacksActive || '—'} color="#ff2d55" />
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 16px', borderRadius:'20px', background:'rgba(255,45,85,0.1)', border:'1px solid rgba(255,45,85,0.4)', fontSize:'11px', letterSpacing:'2px', color:'#ff2d55' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#ff2d55', display:'block', animation:'blink 1s infinite' }} />LIVE
            </div>
          </div>
        </header>

        {/* MAP */}
        <div ref={mapRef} style={{ position:'fixed', top:'68px', left:0, right: selectedAttack ? '500px' : 0, bottom:0, transition:'right 0.4s cubic-bezier(0.16,1,0.3,1)' }} />

        {/* ATTACK FEED */}
        <div style={{ position:'fixed', bottom:'20px', left:'20px', width:'300px', maxHeight:'260px', overflowY:'auto', background:'rgba(6,8,20,0.92)', backdropFilter:'blur(20px)', border:'1px solid rgba(0,200,255,0.15)', borderRadius:'12px', padding:'16px', zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#ff2d55', display:'block', animation:'blink 1s infinite' }} />
            <span style={{ fontFamily:'Orbitron', fontSize:'11px', color:'#00c8ff', letterSpacing:'2px' }}>LIVE FEED</span>
          </div>
          {attacks.map(a => (
            <div key={a.id} onClick={() => { setSelectedAttack(a); setActiveTab('overview'); }} style={{ padding:'10px 12px', background:'rgba(0,200,255,0.03)', borderLeft:`3px solid ${getSeverityColor(a.severity)}`, borderRadius:'6px', marginBottom:'8px', fontSize:'11px', cursor:'pointer', transition:'all 0.25s ease', animation:'slideIn 0.4s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.1)';e.currentTarget.style.transform='translateX(4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.03)';e.currentTarget.style.transform='translateX(0)';}}>
              <div style={{ color:'#4a5568', fontSize:'10px', marginBottom:'3px' }}>{a.timestamp.toLocaleTimeString()}</div>
              <div style={{ color:'#e2e8f0', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                <span style={{ color:getSeverityColor(a.severity), fontSize:'10px', fontWeight:700, textTransform:'uppercase' }}>{a.severity}</span>
                <span style={{ color:'#4a5568' }}>·</span>
                <span>{a.attackType}</span>
                <span style={{ color:'#4a5568' }}>·</span>
                <span>{a.source.flag}→{a.target.flag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div style={{ position:'fixed', bottom:'20px', right: selectedAttack ? '520px' : '20px', background:'rgba(6,8,20,0.92)', backdropFilter:'blur(20px)', border:'1px solid rgba(0,200,255,0.15)', borderRadius:'12px', padding:'14px 18px', zIndex:50, transition:'right 0.4s cubic-bezier(0.16,1,0.3,1)', fontSize:'11px' }}>
          <div style={{ fontFamily:'Orbitron', fontSize:'10px', color:'#00c8ff', letterSpacing:'2px', marginBottom:'12px' }}>SEVERITY</div>
          {[['critical','#ff2d55'],['high','#ff6b35'],['medium','#ffd60a'],['low','#30d158']].map(([label,color])=>(
            <div key={label} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <div style={{ width:'28px', height:'2px', background:color, boxShadow:`0 0 6px ${color}`, borderRadius:2 }} />
              <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}` }} />
              <span style={{ color:'#718096', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            RICH DETAIL PANEL
        ═══════════════════════════════════════════ */}
        {selectedAttack && info && (
          <div style={{ position:'fixed', right:0, top:'68px', bottom:0, width:'500px', background:'rgba(5,6,18,0.99)', backdropFilter:'blur(24px)', borderLeft:'1px solid rgba(0,200,255,0.12)', overflowY:'auto', zIndex:90, animation:'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column' }}>

            {/* Panel top bar */}
            <div style={{ padding:'22px 22px 0', borderBottom:'1px solid rgba(0,200,255,0.1)', flexShrink:0, position:'sticky', top:0, background:'rgba(5,6,18,0.99)', zIndex:10 }}>

              <button onClick={() => setSelectedAttack(null)} style={{ position:'absolute', top:'18px', right:'18px', width:'30px', height:'30px', background:'rgba(255,45,85,0.15)', border:'1px solid rgba(255,45,85,0.4)', borderRadius:'50%', color:'#ff2d55', fontSize:'13px', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#ff2d55';e.currentTarget.style.color='white';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,45,85,0.15)';e.currentTarget.style.color='#ff2d55';}}>✕</button>

              {/* Title row */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <span style={{ fontSize:'26px' }}>{info.icon}</span>
                <div>
                  <div style={{ fontFamily:'Orbitron', fontSize:'17px', fontWeight:900, color:'#f0f4ff' }}>{selectedAttack.attackType}</div>
                  <div style={{ color:'#4a5568', fontSize:'10px', marginTop:'1px' }}>{info.fullName}</div>
                </div>
                <span style={{ marginLeft:'auto', marginRight:'36px', padding:'4px 10px', borderRadius:'20px', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', background:`${getSeverityColor(selectedAttack.severity)}18`, color:getSeverityColor(selectedAttack.severity), border:`1px solid ${getSeverityColor(selectedAttack.severity)}55`, boxShadow:`0 0 14px ${getSeverityGlow(selectedAttack.severity)}` }}>
                  {selectedAttack.severity}
                </span>
              </div>

              {/* Route bar */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 12px', background:'rgba(0,200,255,0.04)', borderRadius:'8px', border:'1px solid rgba(0,200,255,0.1)', marginBottom:'12px', fontSize:'12px' }}>
                <span style={{ fontSize:'18px' }}>{selectedAttack.source.flag}</span>
                <span style={{ color:'#718096' }}>{selectedAttack.source.name}</span>
                <span style={{ color:'#00c8ff', margin:'0 4px' }}>⟶</span>
                <span style={{ fontSize:'18px' }}>{selectedAttack.target.flag}</span>
                <span style={{ color:'#718096' }}>{selectedAttack.target.name}</span>
                <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
                  <Chip label={selectedAttack.sector} color="#7b2dff" />
                  <Chip label={selectedAttack.protocol} color="#00c8ff" />
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px', marginBottom:'12px' }}>
                <MiniStat label="Affected" value={`~${selectedAttack.affected.toLocaleString()}`} />
                <MiniStat label="Port" value={selectedAttack.port} />
                <MiniStat label="Time" value={selectedAttack.timestamp.toLocaleTimeString()} />
              </div>

              {/* Tabs */}
              <div style={{ display:'flex', gap:'1px', overflowX:'auto' }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex:'none', padding:'9px 12px', background: activeTab===tab.id ? 'rgba(0,200,255,0.08)' : 'transparent', border:'none', borderBottom: activeTab===tab.id ? '2px solid #00c8ff' : '2px solid transparent', color: activeTab===tab.id ? '#00c8ff' : '#4a5568', fontSize:'10px', fontFamily:"'Share Tech Mono',monospace", cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', letterSpacing:'0.5px' }}>
                    {tab.icon} {tab.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable tab content */}
            <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div>
                  <SectionLabel>WHAT IS THIS ATTACK?</SectionLabel>
                  <div style={{ display:'flex', gap:'5px', marginBottom:'12px' }}>
                    {['beginner','intermediate','expert'].map(m => (
                      <button key={m} onClick={() => setLearningMode(m)} style={{ flex:1, padding:'7px 4px', borderRadius:'6px', fontSize:'9px', fontFamily:'Orbitron', letterSpacing:'0.5px', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', background: learningMode===m ? 'rgba(0,200,255,0.12)' : 'transparent', border: learningMode===m ? '1px solid #00c8ff' : '1px solid rgba(0,200,255,0.2)', color: learningMode===m ? '#00c8ff' : '#4a5568', boxShadow: learningMode===m ? '0 0 12px rgba(0,200,255,0.15)' : 'none' }}>{m}</button>
                    ))}
                  </div>
                  <div style={{ padding:'14px 16px', lineHeight:1.9, fontSize:'13px', color:'#a0aec0', background:'rgba(0,200,255,0.03)', borderLeft:`3px solid ${getSeverityColor(selectedAttack.severity)}`, borderRadius:'8px', marginBottom:'18px' }}>
                    {OVERVIEW_TEXT[learningMode][selectedAttack.attackType]}
                  </div>

                  <SectionLabel>ATTACK METADATA</SectionLabel>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
                    {[
                      ['Source', `${selectedAttack.source.flag} ${selectedAttack.source.name}`],
                      ['Target', `${selectedAttack.target.flag} ${selectedAttack.target.name}`],
                      ['Sector', selectedAttack.sector],
                      ['Protocol', selectedAttack.protocol],
                      ['Port', selectedAttack.port],
                      ['Affected', `~${selectedAttack.affected.toLocaleString()}`]
                    ].map(([k,v]) => (
                      <div key={k} style={{ padding:'9px 11px', background:'rgba(0,200,255,0.04)', border:'1px solid rgba(0,200,255,0.1)', borderRadius:'7px' }}>
                        <div style={{ color:'#4a5568', fontSize:'9px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'3px' }}>{k}</div>
                        <div style={{ color:'#e2e8f0', fontSize:'12px' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── KILL CHAIN ── */}
              {activeTab === 'killchain' && (
                <div>
                  <SectionLabel>ATTACK KILL CHAIN</SectionLabel>
                  <p style={{ color:'#4a5568', fontSize:'11px', marginBottom:'18px', lineHeight:1.7 }}>
                    The kill chain maps every phase an attacker goes through — from first recon to final impact. Defenders who understand each phase can interrupt the attack before it reaches the end.
                  </p>
                  <div style={{ position:'relative' }}>
                    {info.killChain.map((step, i) => (
                      <div key={i} style={{ display:'flex', gap:'14px', marginBottom:'4px', position:'relative' }}>
                        {i < info.killChain.length-1 && (
                          <div style={{ position:'absolute', left:'18px', top:'38px', width:'2px', height:'calc(100% + 4px)', background:'linear-gradient(180deg,rgba(0,200,255,0.35),rgba(0,200,255,0.04))', zIndex:0 }} />
                        )}
                        <div style={{ flexShrink:0, width:'36px', height:'36px', borderRadius:'50%', background: i===info.killChain.length-1 ? 'rgba(255,45,85,0.2)' : 'rgba(0,200,255,0.1)', border:`2px solid ${i===info.killChain.length-1 ? '#ff2d55' : 'rgba(0,200,255,0.4)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', zIndex:1, boxShadow: i===info.killChain.length-1 ? '0 0 14px rgba(255,45,85,0.4)' : '0 0 8px rgba(0,200,255,0.2)' }}>
                          {step.icon}
                        </div>
                        <div style={{ flex:1, padding:'9px 13px', background: i===info.killChain.length-1 ? 'rgba(255,45,85,0.06)' : 'rgba(0,200,255,0.04)', border:`1px solid ${i===info.killChain.length-1 ? 'rgba(255,45,85,0.25)' : 'rgba(0,200,255,0.1)'}`, borderRadius:'8px', marginBottom:'8px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                            <span style={{ fontFamily:'Orbitron', fontSize:'9px', color: i===info.killChain.length-1 ? '#ff2d55' : '#00c8ff', letterSpacing:'1px' }}>PHASE {i+1}</span>
                            <span style={{ color:'#e2e8f0', fontSize:'12px', fontWeight:700 }}>{step.phase}</span>
                          </div>
                          <p style={{ color:'#718096', fontSize:'12px', margin:0, lineHeight:1.7 }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── MITRE ── */}
              {activeTab === 'mitre' && (
                <div>
                  <SectionLabel>MITRE ATT&CK FRAMEWORK</SectionLabel>
                  <p style={{ color:'#4a5568', fontSize:'11px', marginBottom:'18px', lineHeight:1.7 }}>
                    MITRE ATT&CK is a globally-used knowledge base of real-world adversary tactics and techniques. Security teams use it to classify attacks, build detections, and measure coverage gaps.
                  </p>

                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                    <MitreCard label="TACTIC" id={info.mitre.tacticId} name={info.mitre.tactic} desc="The adversary's high-level goal or objective — what they are ultimately trying to achieve in this phase" color="#7b2dff" />
                    <div style={{ display:'flex', justifyContent:'center' }}><div style={{ width:2, height:16, background:'linear-gradient(180deg,#7b2dff,#00c8ff)' }} /></div>
                    <MitreCard label="TECHNIQUE" id={info.mitre.techniqueId} name={info.mitre.technique} desc="The specific method the attacker uses to achieve the tactic — how they actually execute their goal" color="#00c8ff" />
                    {info.mitre.subId !== info.mitre.techniqueId && (
                      <>
                        <div style={{ display:'flex', justifyContent:'center' }}><div style={{ width:2, height:16, background:'linear-gradient(180deg,#00c8ff,#30d158)' }} /></div>
                        <MitreCard label="SUB-TECHNIQUE" id={info.mitre.subId} name={info.mitre.subTechnique} desc="A more specific implementation or variant of the parent technique used in this attack" color="#30d158" />
                      </>
                    )}
                  </div>

                  <a href={info.mitre.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'11px 14px', background:'rgba(0,200,255,0.06)', border:'1px solid rgba(0,200,255,0.25)', borderRadius:'8px', color:'#00c8ff', textDecoration:'none', fontSize:'12px', transition:'all 0.2s', marginBottom:'16px' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,200,255,0.14)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,200,255,0.06)';}}>
                    <span>🔗</span>
                    <span>View {info.mitre.techniqueId} on MITRE ATT&CK →</span>
                  </a>

                  <div style={{ padding:'13px 15px', background:'rgba(123,45,255,0.06)', border:'1px solid rgba(123,45,255,0.2)', borderRadius:'8px' }}>
                    <div style={{ fontFamily:'Orbitron', fontSize:'9px', color:'#7b2dff', letterSpacing:'1.5px', marginBottom:'7px' }}>WHY THIS MATTERS</div>
                    <p style={{ color:'#718096', fontSize:'12px', margin:0, lineHeight:1.8 }}>
                      By mapping attacks to ATT&CK IDs, security teams can build precise detection rules in SIEMs, identify gaps in their defensive coverage, and benchmark their security posture against real-world adversary behaviour observed across thousands of incidents globally.
                    </p>
                  </div>
                </div>
              )}

              {/* ── EXAMPLES ── */}
              {activeTab === 'examples' && (
                <div>
                  <SectionLabel>REAL-WORLD INCIDENTS</SectionLabel>
                  <p style={{ color:'#4a5568', fontSize:'11px', marginBottom:'18px', lineHeight:1.7 }}>
                    These are documented real attacks carried out using this exact technique. Understanding what actually happened — and the real-world scale — makes the threat concrete and memorable.
                  </p>
                  {info.realWorld.map((ex, i) => (
                    <div key={i} style={{ padding:'15px', background:'rgba(0,200,255,0.03)', border:'1px solid rgba(0,200,255,0.1)', borderRadius:'10px', marginBottom:'12px', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg, ${getSeverityColor(selectedAttack.severity)}, transparent)` }} />
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', marginBottom:'9px' }}>
                        <div style={{ fontFamily:'Orbitron', fontSize:'12px', color:'#f0f4ff', fontWeight:700 }}>{ex.name}</div>
                        <span style={{ flexShrink:0, padding:'3px 9px', borderRadius:'12px', fontSize:'9px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', background:`${getBadgeColor(ex.badge)}22`, color:getBadgeColor(ex.badge), border:`1px solid ${getBadgeColor(ex.badge)}44` }}>{ex.badge}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'7px' }}>
                        <span style={{ color:'#4a5568', fontSize:'9px', textTransform:'uppercase', letterSpacing:'1px' }}>Target:</span>
                        <span style={{ color:'#a0aec0', fontSize:'11px' }}>{ex.target}</span>
                      </div>
                      <p style={{ color:'#718096', fontSize:'12px', margin:'0 0 9px', lineHeight:1.75 }}>{ex.impact}</p>
                      <div style={{ padding:'7px 11px', background:`${getSeverityColor(selectedAttack.severity)}10`, border:`1px solid ${getSeverityColor(selectedAttack.severity)}30`, borderRadius:'6px', display:'flex', alignItems:'center', gap:'7px' }}>
                        <span style={{ fontSize:'11px' }}>📊</span>
                        <span style={{ color:getSeverityColor(selectedAttack.severity), fontSize:'11px', fontWeight:700 }}>{ex.scale}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── DEFEND ── */}
              {activeTab === 'defend' && (
                <div>
                  <SectionLabel>DEFENCE & MITIGATION</SectionLabel>
                  <p style={{ color:'#4a5568', fontSize:'11px', marginBottom:'14px', lineHeight:1.7 }}>
                    Select your level to see the most relevant defences. Implementing even basic controls dramatically reduces your risk — defence in depth means layering multiple mitigations.
                  </p>
                  <div style={{ display:'flex', gap:'5px', marginBottom:'18px' }}>
                    {['beginner','intermediate','expert'].map(m => (
                      <button key={m} onClick={() => setLearningMode(m)} style={{ flex:1, padding:'7px 4px', borderRadius:'6px', fontSize:'9px', fontFamily:'Orbitron', letterSpacing:'0.5px', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', background: learningMode===m ? 'rgba(48,209,88,0.12)' : 'transparent', border: learningMode===m ? '1px solid #30d158' : '1px solid rgba(0,200,255,0.2)', color: learningMode===m ? '#30d158' : '#4a5568', boxShadow: learningMode===m ? '0 0 12px rgba(48,209,88,0.15)' : 'none' }}>{m}</button>
                    ))}
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'18px' }}>
                    {info.mitigations[learningMode].map((step, i) => (
                      <div key={i} style={{ display:'flex', gap:'11px', padding:'11px 13px', background:'rgba(48,209,88,0.04)', border:'1px solid rgba(48,209,88,0.14)', borderRadius:'8px', alignItems:'flex-start' }}>
                        <div style={{ flexShrink:0, width:'22px', height:'22px', borderRadius:'50%', background:'rgba(48,209,88,0.15)', border:'1px solid rgba(48,209,88,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#30d158', fontFamily:'Orbitron', fontWeight:700 }}>{i+1}</div>
                        <p style={{ color:'#a0aec0', fontSize:'12px', margin:0, lineHeight:1.8 }}>{step}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:'13px 15px', background:'rgba(255,214,10,0.04)', border:'1px solid rgba(255,214,10,0.18)', borderRadius:'8px' }}>
                    <div style={{ fontFamily:'Orbitron', fontSize:'9px', color:'#ffd60a', letterSpacing:'1.5px', marginBottom:'7px' }}>⚡ KEY PRINCIPLE</div>
                    <p style={{ color:'#718096', fontSize:'12px', margin:0, lineHeight:1.8 }}>
                      No single control is sufficient. Layer multiple mitigations so that if one fails, others still protect you. Start with the basics — patch management, MFA, and backups alone stop the vast majority of attacks.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        <style jsx global>{`
          * { box-sizing: border-box; }
          body { margin: 0; }
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

function StatBadge({ label, value, color }) {
  return (
    <div>
      <div style={{ color:'#4a5568', fontSize:'9px', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'2px' }}>{label}</div>
      <div style={{ color, fontFamily:'Orbitron', fontSize:'18px', fontWeight:700, textShadow:`0 0 20px ${color}55` }}>{value}</div>
    </div>
  );
}
function SectionLabel({ children }) {
  return <div style={{ fontFamily:'Orbitron', fontSize:'10px', color:'#00c8ff', letterSpacing:'2px', marginBottom:'13px', paddingBottom:'7px', borderBottom:'1px solid rgba(0,200,255,0.1)' }}>{children}</div>;
}
function MiniStat({ label, value }) {
  return (
    <div style={{ padding:'7px 9px', background:'rgba(0,200,255,0.04)', border:'1px solid rgba(0,200,255,0.1)', borderRadius:'6px', textAlign:'center' }}>
      <div style={{ color:'#4a5568', fontSize:'9px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'3px' }}>{label}</div>
      <div style={{ color:'#e2e8f0', fontSize:'11px' }}>{value}</div>
    </div>
  );
}
function Chip({ label, color }) {
  return <span style={{ padding:'3px 7px', borderRadius:'4px', fontSize:'9px', background:`${color}18`, color, border:`1px solid ${color}44`, letterSpacing:'0.5px' }}>{label}</span>;
}
function MitreCard({ label, id, name, desc, color }) {
  return (
    <div style={{ padding:'12px 14px', background:`${color}08`, border:`1px solid ${color}28`, borderRadius:'9px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
        <span style={{ padding:'2px 7px', borderRadius:'4px', fontSize:'9px', fontFamily:'Orbitron', letterSpacing:'1px', background:`${color}20`, color, border:`1px solid ${color}50` }}>{label}</span>
        <span style={{ color, fontSize:'11px', fontFamily:'Orbitron', fontWeight:700 }}>{id}</span>
        <span style={{ color:'#e2e8f0', fontSize:'12px', fontWeight:700 }}>{name}</span>
      </div>
      <p style={{ color:'#718096', fontSize:'11px', margin:0, lineHeight:1.7 }}>{desc}</p>
    </div>
  );
}
