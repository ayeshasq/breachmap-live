import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
  const [attacks, setAttacks] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [stats, setStats] = useState({
    attacksToday: 45234,
    attacksActive: 0,
    mostTargeted: 'US'
  });
  const [learningMode, setLearningMode] = useState('beginner');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const attackLayersRef = useRef([]);

  // Attack data
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

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[severity] || '#6b7280';
  };

  const generateAttack = () => {
    const source = countries[Math.floor(Math.random() * countries.length)];
    let target = countries[Math.floor(Math.random() * countries.length)];
    while (target.code === source.code) {
      target = countries[Math.floor(Math.random() * countries.length)];
    }

    return {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      source,
      target,
      attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      protocol: 'HTTP',
      port: Math.floor(Math.random() * 65535),
      sector: ['Financial', 'Healthcare', 'Government', 'Education', 'Retail'][Math.floor(Math.random() * 5)],
      affected: Math.floor(Math.random() * 10000) + 100
    };
  };

  const createArcCoordinates = (start, end, steps = 50) => {
    const coordinates = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lng = start[0] + (end[0] - start[0]) * t;
      const lat = start[1] + (end[1] - start[1]) * t;
      coordinates.push([lng, lat]);
    }
    return coordinates;
  };

  const addAttackToMap = (attack) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const lineId = `attack-line-${attack.id}`;
    const pointId = `attack-point-${attack.id}`;
    
    // Create arc coordinates
    const arcCoordinates = createArcCoordinates(attack.source.coords, attack.target.coords);

    // Add attack line source
    map.addSource(lineId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: arcCoordinates
        }
      }
    });

    // Add attack line layer
    map.addLayer({
      id: lineId,
      type: 'line',
      source: lineId,
      paint: {
        'line-color': getSeverityColor(attack.severity),
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    // Add pulsing point at target
    map.addSource(pointId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          attack: JSON.stringify(attack)
        },
        geometry: {
          type: 'Point',
          coordinates: attack.target.coords
        }
      }
    });

    map.addLayer({
      id: pointId,
      type: 'circle',
      source: pointId,
      paint: {
        'circle-radius': 8,
        'circle-color': getSeverityColor(attack.severity),
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.5
      }
    });

    // Add click handler for the point
    map.on('click', pointId, (e) => {
      const attackData = JSON.parse(e.features[0].properties.attack);
      setSelectedAttack(attackData);
    });

    // Change cursor on hover
    map.on('mouseenter', pointId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', pointId, () => {
      map.getCanvas().style.cursor = '';
    });

    attackLayersRef.current.push({ lineId, pointId });

    // Remove after 10 seconds
    setTimeout(() => {
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);
      if (map.getLayer(pointId)) map.removeLayer(pointId);
      if (map.getSource(pointId)) map.removeSource(pointId);
      attackLayersRef.current = attackLayersRef.current.filter(
        layer => layer.lineId !== lineId
      );
    }, 10000);
  };

  // Initialize Mapbox
  useEffect(() => {
    if (typeof window === 'undefined' || !window.mapboxgl) return;

    window.mapboxgl.accessToken = 'pk.eyJ1IjoiYnJlYWNobWFwIiwiYSI6ImNtNXRlc3RkZW1hcHkyanB6ZmJ0ZXN0In0.test';

    const map = new window.mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 20],
      pitch: 0
    });

    map.on('load', () => {
      // Add atmosphere
      map.setFog({
        color: 'rgb(10, 14, 26)',
        'high-color': 'rgb(0, 217, 255)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(10, 14, 26)',
        'star-intensity': 0.15
      });

      // Auto-rotate globe
      let userInteracting = false;
      let spinEnabled = true;

      const spinGlobe = () => {
        if (spinEnabled && !userInteracting) {
          const center = map.getCenter();
          center.lng -= 0.3;
          map.easeTo({ center, duration: 1000, easing: t => t });
        }
      };

      map.on('mousedown', () => { userInteracting = true; });
      map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
      map.on('dragend', () => { userInteracting = false; spinGlobe(); });
      map.on('pitchend', () => { userInteracting = false; spinGlobe(); });
      map.on('rotateend', () => { userInteracting = false; spinGlobe(); });
      map.on('moveend', () => {
        if (!userInteracting) spinGlobe();
      });

      const spinInterval = setInterval(spinGlobe, 1000);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      return () => {
        clearInterval(spinInterval);
        spinEnabled = false;
      };
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Generate attacks
  useEffect(() => {
    const interval = setInterval(() => {
      const newAttack = generateAttack();
      setAttacks(prev => [newAttack, ...prev].slice(0, 20));
      setStats(prev => ({
        ...prev,
        attacksToday: prev.attacksToday + 1,
        attacksActive: Math.floor(Math.random() * 150) + 50
      }));

      if (mapLoaded && mapInstanceRef.current) {
        addAttackToMap(newAttack);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mapLoaded]);

  return (
    <>
      <Head>
        <title>BreachMap Live - Real-Time Cyber Threat Intelligence</title>
        <meta name="description" content="Real-time cyber threat visualization with 3D globe" />
        <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />
      </Head>

      <Script 
        src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"
        strategy="beforeInteractive"
      />

      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0e1a' }}>
        {/* Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.95) 0%, rgba(10, 14, 26, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          zIndex: 100
        }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '28px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #00d9ff, #a55eea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px'
          }}>
            BREACHMAP LIVE
          </h1>

          <div style={{ display: 'flex', gap: '40px', marginLeft: 'auto', fontSize: '12px' }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Attacks Today</div>
              <div style={{ color: '#00d9ff', fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700 }}>
                {stats.attacksToday.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase' }}>Active Now</div>
              <div style={{ color: '#00d9ff', fontSize: '20px', fontFamily: 'Orbitron', fontWeight: 700 }}>
                {stats.attacksActive}
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 71, 87, 0.1)',
              border: '1px solid #ff4757',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#ff4757',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <span>LIVE</span>
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div 
          ref={mapRef} 
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: selectedAttack ? '450px' : 0,
            bottom: 0,
            transition: 'right 0.4s ease'
          }}
        />

        {/* Attack Feed */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '350px',
          maxHeight: '300px',
          overflowY: 'auto',
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          zIndex: 50
        }}>
          <h3 style={{
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#00d9ff',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            🔴 Live Attack Feed
          </h3>
          {attacks.map((attack) => (
            <div
              key={attack.id}
              onClick={() => setSelectedAttack(attack)}
              style={{
                padding: '12px',
                background: 'rgba(0, 217, 255, 0.05)',
                borderLeft: `3px solid ${getSeverityColor(attack.severity)}`,
                borderRadius: '6px',
                marginBottom: '10px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                animation: 'slideIn 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}>
                {attack.timestamp.toLocaleTimeString()}
              </div>
              <div style={{ color: '#e5e7eb' }}>
                {attack.attackType} • {attack.source.flag} → {attack.target.flag} {attack.target.name}
              </div>
            </div>
          ))}
        </div>

        {/* Attack Details Panel */}
        {selectedAttack && (
          <div style={{
            position: 'fixed',
            right: 0,
            top: '80px',
            bottom: 0,
            width: '450px',
            background: 'rgba(17, 24, 39, 0.98)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(0, 217, 255, 0.2)',
            overflowY: 'auto',
            zIndex: 90,
            animation: 'slideInRight 0.4s ease'
          }}>
            <button
              onClick={() => setSelectedAttack(null)}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                width: '40px',
                height: '40px',
                background: 'rgba(255, 71, 87, 0.2)',
                border: '1px solid #ff4757',
                borderRadius: '50%',
                color: '#ff4757',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff4757';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)';
                e.currentTarget.style.color = '#ff4757';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>

            <div style={{ padding: '30px', borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
              <div style={{
                fontFamily: 'Orbitron',
                fontSize: '24px',
                fontWeight: 900,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {selectedAttack.attackType}
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: getSeverityColor(selectedAttack.severity),
                  color: 'white'
                }}>
                  {selectedAttack.severity}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '16px',
                marginTop: '16px',
                padding: '16px',
                background: 'rgba(0, 217, 255, 0.05)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '28px' }}>{selectedAttack.source.flag}</span>
                <span>{selectedAttack.source.name}</span>
                <span style={{ color: '#00d9ff', fontSize: '20px' }}>→</span>
                <span style={{ fontSize: '28px' }}>{selectedAttack.target.flag}</span>
                <span>{selectedAttack.target.name}</span>
              </div>
            </div>

            <div style={{ padding: '30px' }}>
              <h4 style={{
                fontFamily: 'Orbitron',
                fontSize: '14px',
                color: '#00d9ff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                📊 Attack Details
              </h4>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '30px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Timestamp</span>
                  <span>{selectedAttack.timestamp.toLocaleTimeString()}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Target Sector</span>
                  <span>{selectedAttack.sector}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Protocol</span>
                  <span>{selectedAttack.protocol}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#9ca3af' }}>Affected Systems</span>
                  <span>~{selectedAttack.affected.toLocaleString()}</span>
                </div>
              </div>

              <h4 style={{
                fontFamily: 'Orbitron',
                fontSize: '14px',
                color: '#00d9ff',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                📚 What is this attack?
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['beginner', 'intermediate', 'expert'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLearningMode(mode)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: learningMode === mode 
                        ? 'linear-gradient(135deg, #00d9ff, #a55eea)' 
                        : 'rgba(0, 217, 255, 0.1)',
                      border: learningMode === mode ? 'none' : '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '8px',
                      color: learningMode === mode ? 'white' : '#9ca3af',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: learningMode === mode ? '0 4px 15px rgba(0, 217, 255, 0.4)' : 'none'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div style={{
                lineHeight: 1.8,
                fontSize: '14px',
                padding: '20px',
                background: 'rgba(0, 217, 255, 0.05)',
                borderLeft: '3px solid #00d9ff',
                borderRadius: '8px'
              }}>
                {explanations[learningMode][selectedAttack.attackType]}
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}
