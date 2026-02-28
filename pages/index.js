import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [attacks, setAttacks] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [stats, setStats] = useState({ attacksToday: 45234, attacksActive: 0 });
  const [learningMode, setLearningMode] = useState('beginner');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const attackLayersRef = useRef([]);
  const spinRef = useRef(null);
  const userInteractingRef = useRef(false);
  const lastTimeRef = useRef(null);

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

  const explanations = {
    beginner: {
      'DDoS': "A DDoS attack is like thousands of people calling a restaurant at the same time, so real customers can't get through. Hackers use infected computers to flood a website with fake traffic until it crashes.",
      'Malware': "Malware is malicious software designed to harm your computer or steal your data. It can steal passwords, encrypt files, or turn your device into a bot.",
      'Phishing': "Phishing is a trick where attackers pretend to be trustworthy to steal your personal information through fake emails or websites.",
      'Ransomware': "Ransomware locks all your files and demands payment to unlock them. It's like a digital kidnapping of your data.",
      'Data Breach': "A data breach happens when hackers break into a database and steal sensitive information like passwords and credit cards.",
      'SQL Injection': "SQL Injection is when hackers exploit poorly secured websites by injecting malicious code into web forms."
    },
    intermediate: {
      'DDoS': "This DDoS attack uses a botnet to send HTTP flood requests at ~50,000 req/sec. The target's CDN is overwhelmed. Common defenses include rate limiting and traffic scrubbing.",
      'Malware': "This malware uses phishing emails and exploit kits. It establishes persistence through registry modifications. Defense includes EDR and network segmentation.",
      'Phishing': "This phishing campaign uses domain spoofing and SSL certificates. Defense includes email authentication (SPF, DKIM, DMARC) and MFA.",
      'Ransomware': "This ransomware uses RSA-2048 encryption and spreads via RDP exploits. Mitigation involves offline backups and network segmentation.",
      'Data Breach': "This breach exploited SQL injection to extract customer records. Prevention requires prepared statements and WAF.",
      'SQL Injection': "This attack uses blind injection techniques. Prevention requires parameterized queries and input validation."
    },
    expert: {
      'DDoS': "HTTP flood DDoS leveraging Mirai botnet. Attack: 420 Gbps sustained, 50M PPS from 15,000+ IoT endpoints. MITRE: T1498.002. Deploy AWS Shield, implement SYN cookies, BGP blacklisting.",
      'Malware': "APT campaign with C2 via DNS tunneling. Exploitation of CVE-2022-30190. Lateral movement via Pass-the-Hash. MITRE: T1566.001, T1047. Deploy EDR with behavioral analysis.",
      'Phishing': "BEC campaign using AiTM proxies to bypass MFA. Session hijacking via Evilginx2. MITRE: T1566.002, T1539. Defense: FIDO2 keys, conditional access policies.",
      'Ransomware': "LockBit 3.0 with double extortion. ChaCha20 + RSA-4096. Exploitation via CVE-2023-3519. MITRE: T1486. Implement zero-trust, immutable backups.",
      'Data Breach': "Second-order SQL injection. Boolean-based enumeration, OUT-OF-BAND exfiltration. MITRE: T1190. Implement stored procedures, DAM, column-level encryption.",
      'SQL Injection': "Polyglot payloads bypassing WAF. Union-based injection with error-based extraction. MITRE: T1190. Deploy ModSecurity with OWASP rules."
    }
  };

  const getSeverityColor = (severity) => ({
    critical: '#ff2d55',
    high: '#ff6b35',
    medium: '#ffd60a',
    low: '#30d158'
  }[severity] || '#00d9ff');

  const getSeverityGlow = (severity) => ({
    critical: 'rgba(255, 45, 85, 0.8)',
    high: 'rgba(255, 107, 53, 0.8)',
    medium: 'rgba(255, 214, 10, 0.8)',
    low: 'rgba(48, 209, 88, 0.8)'
  }[severity] || 'rgba(0, 217, 255, 0.8)');

  // Bezier curve with raised midpoint for globe arc feel
  const createBezierArc = (start, end, steps = 80) => {
    const coords = [];
    // Midpoint elevated — simulates a great-circle arc visually
    const midLng = (start[0] + end[0]) / 2;
    const midLat = (start[1] + end[1]) / 2 + Math.abs(end[0] - start[0]) * 0.25;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      // Quadratic bezier
      const lng = mt * mt * start[0] + 2 * mt * t * midLng + t * t * end[0];
      const lat = mt * mt * start[1] + 2 * mt * t * midLat + t * t * end[1];
      coords.push([lng, lat]);
    }
    return coords;
  };

  const addAttackToMap = (attack) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean old layers beyond limit
    while (attackLayersRef.current.length >= 8) {
      const old = attackLayersRef.current.shift();
      ['glowId', 'lineId', 'dotId', 'pulseId'].forEach(key => {
        if (old[key]) {
          if (map.getLayer(old[key])) map.removeLayer(old[key]);
          if (map.getSource(old[key])) map.removeSource(old[key]);
        }
      });
    }

    const uid = `${attack.id}-${Date.now()}`;
    const lineId = `line-${uid}`;
    const glowId = `glow-${uid}`;
    const dotId = `dot-${uid}`;
    const pulseId = `pulse-${uid}`;
    const color = getSeverityColor(attack.severity);
    const fullArc = createBezierArc(attack.source.coords, attack.target.coords);

    // --- Add glow (wide blurry line) ---
    map.addSource(glowId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [attack.source.coords] } } });
    map.addLayer({ id: glowId, type: 'line', source: glowId, paint: { 'line-color': color, 'line-width': 8, 'line-opacity': 0.25, 'line-blur': 6 } });

    // --- Add sharp line ---
    map.addSource(lineId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [attack.source.coords] } } });
    map.addLayer({ id: lineId, type: 'line', source: lineId, paint: { 'line-color': color, 'line-width': 1.5, 'line-opacity': 0.95 } });

    // --- Pulse rings at target ---
    map.addSource(pulseId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: attack.target.coords } } });
    map.addLayer({ id: pulseId, type: 'circle', source: pulseId, paint: { 'circle-radius': 0, 'circle-color': 'transparent', 'circle-stroke-color': color, 'circle-stroke-width': 2, 'circle-stroke-opacity': 0, 'circle-pitch-alignment': 'map' } });

    // --- Dot at moving tip ---
    map.addSource(dotId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: attack.source.coords } } });
    map.addLayer({ id: dotId, type: 'circle', source: dotId, paint: { 'circle-radius': 4, 'circle-color': color, 'circle-opacity': 1, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.8, 'circle-pitch-alignment': 'map' } });

    map.on('click', pulseId, () => setSelectedAttack(attack));
    map.on('click', dotId, () => setSelectedAttack(attack));
    ['mouseenter', 'mouseleave'].forEach(evt => {
      map.on(evt, dotId, () => { map.getCanvas().style.cursor = evt === 'mouseenter' ? 'pointer' : ''; });
      map.on(evt, pulseId, () => { map.getCanvas().style.cursor = evt === 'mouseenter' ? 'pointer' : ''; });
    });

    attackLayersRef.current.push({ lineId, glowId, dotId, pulseId });

    // === ANIMATE ARC DRAWING ===
    const totalSteps = fullArc.length;
    const drawDuration = 1800; // ms to draw the arc
    const startTime = performance.now();
    let drawn = false;

    const animateDraw = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / drawDuration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const visibleCount = Math.max(2, Math.floor(eased * totalSteps));
      const visibleCoords = fullArc.slice(0, visibleCount);

      const arcData = { type: 'Feature', geometry: { type: 'LineString', coordinates: visibleCoords } };
      if (map.getSource(lineId)) map.getSource(lineId).setData(arcData);
      if (map.getSource(glowId)) map.getSource(glowId).setData(arcData);

      // Move tip dot
      const tipCoord = visibleCoords[visibleCoords.length - 1];
      if (map.getSource(dotId)) map.getSource(dotId).setData({ type: 'Feature', geometry: { type: 'Point', coordinates: tipCoord } });

      if (progress < 1) {
        requestAnimationFrame(animateDraw);
      } else {
        drawn = true;
        // Snap dot to target
        if (map.getSource(dotId)) map.getSource(dotId).setData({ type: 'Feature', geometry: { type: 'Point', coordinates: attack.target.coords } });
        // Animate pulse rings
        animatePulse(performance.now(), 0);
      }
    };

    // === PULSE RING ANIMATION at target ===
    const animatePulse = (startT, ringIndex) => {
      const ringsTotal = 3;
      const ringDuration = 1200;
      const delay = ringIndex * 400;

      const doRing = (now) => {
        const t = Math.min((now - startT - delay) / ringDuration, 1);
        if (t < 0) { requestAnimationFrame(doRing); return; }
        const radius = t * 28;
        const opacity = (1 - t) * 0.7;
        if (map.getLayer(pulseId)) {
          map.setPaintProperty(pulseId, 'circle-stroke-opacity', opacity);
          map.setPaintProperty(pulseId, 'circle-radius', radius);
        }
        if (t < 1) requestAnimationFrame(doRing);
        else if (ringIndex < ringsTotal - 1) animatePulse(startT, ringIndex + 1);
      };
      requestAnimationFrame(doRing);
    };

    requestAnimationFrame(animateDraw);

    // === FADE OUT EVERYTHING after 6s ===
    setTimeout(() => {
      const fadeStart = performance.now();
      const fadeDuration = 800;
      const fadeOut = (now) => {
        const t = Math.min((now - fadeStart) / fadeDuration, 1);
        const op = 1 - t;
        if (map.getLayer(lineId)) map.setPaintProperty(lineId, 'line-opacity', op * 0.95);
        if (map.getLayer(glowId)) map.setPaintProperty(glowId, 'line-opacity', op * 0.25);
        if (map.getLayer(dotId)) map.setPaintProperty(dotId, 'circle-opacity', op);
        if (t < 1) requestAnimationFrame(fadeOut);
        else {
          ['glowId', 'lineId', 'dotId', 'pulseId'].forEach(key => {
            const id = { glowId, lineId, dotId, pulseId }[key];
            if (map.getLayer(id)) map.removeLayer(id);
            if (map.getSource(id)) map.removeSource(id);
          });
          attackLayersRef.current = attackLayersRef.current.filter(l => l.lineId !== lineId);
        }
      };
      requestAnimationFrame(fadeOut);
    }, 6000);
  };

  // Initialize Mapbox
  useEffect(() => {
    if (typeof window === 'undefined' || !window.mapboxgl) return;

    window.mapboxgl.accessToken = 'pk.eyJ1IjoiYXllc2hhc3EiLCJhIjoiY21qNDBvOGF0MDB3ODNmcTJwbXFuaTY3eSJ9.EKiY5BPeiDF3s-tYkHGUfg';

    const map = new window.mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.8,
      center: [15, 25],
      pitch: 0,
      antialias: true
    });

    map.on('load', () => {
      // Deep space atmosphere — matches Kaspersky's dark purple-blue globe
      map.setFog({
        color: 'rgb(6, 8, 20)',
        'high-color': 'rgb(20, 40, 100)',
        'horizon-blend': 0.04,
        'space-color': 'rgb(4, 4, 16)',
        'star-intensity': 0.6
      });

      // Smooth continuous globe rotation using rAF
      const SPIN_SPEED = 0.012; // degrees per frame @ 60fps ≈ 0.72°/s (slow & cinematic)

      const spinLoop = (timestamp) => {
        if (!userInteractingRef.current) {
          const center = map.getCenter();
          map.setCenter([center.lng - SPIN_SPEED, center.lat]);
        }
        spinRef.current = requestAnimationFrame(spinLoop);
      };

      spinRef.current = requestAnimationFrame(spinLoop);

      map.on('mousedown', () => { userInteractingRef.current = true; });
      map.on('touchstart', () => { userInteractingRef.current = true; });
      map.on('mouseup', () => { userInteractingRef.current = false; });
      map.on('touchend', () => { userInteractingRef.current = false; });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
    };
  }, []);

  // Generate attacks
  useEffect(() => {
    if (!mapLoaded) return;

    const generateAttack = () => {
      const source = countries[Math.floor(Math.random() * countries.length)];
      let target = countries[Math.floor(Math.random() * countries.length)];
      while (target.code === source.code) target = countries[Math.floor(Math.random() * countries.length)];
      return {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        source, target,
        attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        protocol: ['HTTP', 'TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 4)],
        port: Math.floor(Math.random() * 65535),
        sector: ['Financial', 'Healthcare', 'Government', 'Education', 'Retail'][Math.floor(Math.random() * 5)],
        affected: Math.floor(Math.random() * 10000) + 100
      };
    };

    // Stagger initial attacks
    setTimeout(() => { const a = generateAttack(); setAttacks([a]); addAttackToMap(a); }, 400);
    setTimeout(() => { const a = generateAttack(); setAttacks(p => [a, ...p]); addAttackToMap(a); }, 1200);

    const interval = setInterval(() => {
      const newAttack = generateAttack();
      setAttacks(prev => [newAttack, ...prev].slice(0, 25));
      setStats(prev => ({ attacksToday: prev.attacksToday + 1, attacksActive: Math.floor(Math.random() * 150) + 50 }));
      addAttackToMap(newAttack);
    }, 2200);

    return () => clearInterval(interval);
  }, [mapLoaded]);

  return (
    <>
      <Head>
        <title>BreachMap Live — Real-Time Cyber Threat Intelligence</title>
        <meta name="description" content="Real-time cyber threat visualization with 3D globe" />
        <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </Head>
      <Script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js" strategy="beforeInteractive" />

      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#04040f', fontFamily: "'Share Tech Mono', monospace" }}>

        {/* ── HEADER ── */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '68px',
          background: 'linear-gradient(180deg, rgba(4,4,15,0.97) 0%, rgba(4,4,15,0.75) 100%)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0, 200, 255, 0.15)',
          display: 'flex', alignItems: 'center', padding: '0 32px',
          zIndex: 100, gap: '32px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #00c8ff, #7b2dff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', boxShadow: '0 0 20px rgba(0,200,255,0.5)'
            }}>⚡</div>
            <h1 style={{
              fontFamily: 'Orbitron', fontSize: '20px', fontWeight: 900, margin: 0,
              background: 'linear-gradient(135deg, #00c8ff 0%, #7b2dff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '3px'
            }}>BREACHMAP LIVE</h1>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '32px', alignItems: 'center' }}>
            <StatBadge label="Attacks Today" value={stats.attacksToday.toLocaleString()} color="#00c8ff" />
            <StatBadge label="Active Now" value={stats.attacksActive || '—'} color="#ff2d55" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: '20px',
              background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.4)',
              fontSize: '11px', letterSpacing: '2px', color: '#ff2d55'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2d55', display: 'block', animation: 'blink 1s infinite' }} />
              LIVE
            </div>
          </div>
        </header>

        {/* ── MAP ── */}
        <div ref={mapRef} style={{
          position: 'fixed', top: '68px', left: 0,
          right: selectedAttack ? '460px' : 0, bottom: 0,
          transition: 'right 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />

        {/* ── ATTACK FEED ── */}
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', width: '320px',
          maxHeight: '280px', overflowY: 'auto',
          background: 'rgba(6, 8, 20, 0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 200, 255, 0.15)', borderRadius: '12px',
          padding: '16px', zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff2d55', display: 'block', animation: 'blink 1s infinite' }} />
            <span style={{ fontFamily: 'Orbitron', fontSize: '11px', color: '#00c8ff', letterSpacing: '2px' }}>LIVE FEED</span>
          </div>
          {attacks.map((attack) => (
            <div key={attack.id} onClick={() => setSelectedAttack(attack)} style={{
              padding: '10px 12px',
              background: 'rgba(0,200,255,0.03)',
              borderLeft: `3px solid ${getSeverityColor(attack.severity)}`,
              borderRadius: '6px', marginBottom: '8px', fontSize: '11px',
              cursor: 'pointer', transition: 'all 0.25s ease', animation: 'slideIn 0.4s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ color: '#4a5568', fontSize: '10px', marginBottom: '3px', fontFamily: 'Share Tech Mono' }}>
                {attack.timestamp.toLocaleTimeString()}
              </div>
              <div style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: getSeverityColor(attack.severity), fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {attack.severity}
                </span>
                <span style={{ color: '#4a5568' }}>·</span>
                <span>{attack.attackType}</span>
                <span style={{ color: '#4a5568' }}>·</span>
                <span>{attack.source.flag}→{attack.target.flag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── LEGEND ── */}
        <div style={{
          position: 'fixed', bottom: '20px', right: selectedAttack ? '480px' : '20px',
          background: 'rgba(6,8,20,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,200,255,0.15)', borderRadius: '12px',
          padding: '14px 18px', zIndex: 50, transition: 'right 0.4s cubic-bezier(0.16,1,0.3,1)',
          fontSize: '11px'
        }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: '10px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '12px' }}>SEVERITY</div>
          {[['critical', '#ff2d55'], ['high', '#ff6b35'], ['medium', '#ffd60a'], ['low', '#30d158']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '2px', background: color, boxShadow: `0 0 6px ${color}`, borderRadius: 2 }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <span style={{ color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── DETAIL PANEL ── */}
        {selectedAttack && (
          <div style={{
            position: 'fixed', right: 0, top: '68px', bottom: 0, width: '460px',
            background: 'rgba(6,8,20,0.98)', backdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(0,200,255,0.15)',
            overflowY: 'auto', zIndex: 90, animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)'
          }}>
            {/* Close */}
            <button onClick={() => setSelectedAttack(null)} style={{
              position: 'absolute', top: '24px', right: '24px',
              width: '36px', height: '36px',
              background: 'rgba(255,45,85,0.15)', border: '1px solid rgba(255,45,85,0.4)',
              borderRadius: '50%', color: '#ff2d55', fontSize: '16px',
              cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ff2d55'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,85,0.15)'; e.currentTarget.style.color = '#ff2d55'; }}
            >✕</button>

            {/* Header */}
            <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(0,200,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: '22px', fontWeight: 900, color: '#f0f4ff' }}>
                  {selectedAttack.attackType}
                </span>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '1px',
                  background: `${getSeverityColor(selectedAttack.severity)}22`,
                  color: getSeverityColor(selectedAttack.severity),
                  border: `1px solid ${getSeverityColor(selectedAttack.severity)}66`,
                  boxShadow: `0 0 12px ${getSeverityGlow(selectedAttack.severity)}`
                }}>
                  {selectedAttack.severity}
                </span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px',
                background: 'rgba(0,200,255,0.04)', borderRadius: '10px',
                border: '1px solid rgba(0,200,255,0.1)', fontSize: '14px', color: '#e2e8f0'
              }}>
                <span style={{ fontSize: '24px' }}>{selectedAttack.source.flag}</span>
                <span style={{ color: '#718096', fontSize: '12px' }}>{selectedAttack.source.name}</span>
                <span style={{ color: '#00c8ff', fontSize: '18px', margin: '0 6px' }}>⟶</span>
                <span style={{ fontSize: '24px' }}>{selectedAttack.target.flag}</span>
                <span style={{ color: '#718096', fontSize: '12px' }}>{selectedAttack.target.name}</span>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* Stats grid */}
              <div style={{ fontFamily: 'Orbitron', fontSize: '11px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '14px' }}>
                ATTACK DETAILS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
                {[
                  ['Time', selectedAttack.timestamp.toLocaleTimeString()],
                  ['Sector', selectedAttack.sector],
                  ['Protocol', selectedAttack.protocol],
                  ['Affected', `~${selectedAttack.affected.toLocaleString()}`]
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '12px', background: 'rgba(0,200,255,0.04)', border: '1px solid rgba(0,200,255,0.1)', borderRadius: '8px' }}>
                    <div style={{ color: '#4a5568', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{k}</div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Learning mode */}
              <div style={{ fontFamily: 'Orbitron', fontSize: '11px', color: '#00c8ff', letterSpacing: '2px', marginBottom: '14px' }}>
                WHAT IS THIS ATTACK?
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['beginner', 'intermediate', 'expert'].map((mode) => (
                  <button key={mode} onClick={() => setLearningMode(mode)} style={{
                    flex: 1, padding: '10px 6px', borderRadius: '8px', fontSize: '10px',
                    fontFamily: 'Orbitron', letterSpacing: '1px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    background: learningMode === mode ? 'linear-gradient(135deg, #00c8ff22, #7b2dff22)' : 'transparent',
                    border: learningMode === mode ? '1px solid #00c8ff' : '1px solid rgba(0,200,255,0.2)',
                    color: learningMode === mode ? '#00c8ff' : '#4a5568',
                    boxShadow: learningMode === mode ? '0 0 16px rgba(0,200,255,0.2)' : 'none'
                  }}>{mode}</button>
                ))}
              </div>
              <div style={{
                padding: '18px', lineHeight: 1.85, fontSize: '13px', color: '#a0aec0',
                background: 'rgba(0,200,255,0.03)',
                borderLeft: `3px solid ${getSeverityColor(selectedAttack.severity)}`,
                borderRadius: '8px', fontFamily: 'inherit'
              }}>
                {explanations[learningMode][selectedAttack.attackType]}
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          * { box-sizing: border-box; }
          body { margin: 0; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.3); border-radius: 2px; }
          @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
          @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
          @keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
          .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left { display: none !important; }
        `}</style>
      </div>
    </>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div>
      <div style={{ color: '#4a5568', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>{label}</div>
      <div style={{ color, fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 700, textShadow: `0 0 20px ${color}66` }}>{value}</div>
    </div>
  );
}
