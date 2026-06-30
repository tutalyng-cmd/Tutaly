'use client';

import { useEffect, useState } from 'react';

const liveEvents = [
  {initials:'EM',bg:'#E1F5EE',tc:'#085041',text:'Emeka M. applied to Backend Engineer',time:'just now',badge:'Applied',bbg:'#E1F5EE',btc:'#085041'},
  {initials:'ZA',bg:'#EEEDFE',tc:'#3C3489',text:'Zainab A. got hired at MTN Nigeria',time:'1 min ago',badge:'Hired',bbg:'#EAF3DE',btc:'#27500A'},
  {initials:'AN',bg:'#FAECE7',tc:'#712B13',text:'Andela posted 5 new roles',time:'3 min ago',badge:'New jobs',bbg:'#FAECE7',btc:'#712B13'},
  {initials:'KE',bg:'#FAEEDA',tc:'#633806',text:'Kelvin E. reviewed Flutterwave',time:'5 min ago',badge:'Review',bbg:'#FAEEDA',btc:'#633806'},
  {initials:'FI',bg:'#E6F1FB',tc:'#0C447C',text:'Fiona I. applied to UX Designer',time:'7 min ago',badge:'Applied',bbg:'#E1F5EE',btc:'#085041'},
  {initials:'BS',bg:'#EAF3DE',tc:'#27500A',text:'Blessing S. got hired at Konga',time:'9 min ago',badge:'Hired',bbg:'#EAF3DE',btc:'#27500A'},
];

export default function LiveFeed() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Start with the first 3
    setItems([liveEvents[0], liveEvents[1], liveEvents[2]]);
    let idx = 3;

    const interval = setInterval(() => {
      setItems(prev => {
        const next = [liveEvents[idx % liveEvents.length], ...prev];
        if (next.length > 3) next.pop();
        return next;
      });
      idx++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch by returning empty server-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="live-feed min-h-52" />;

  return (
    <div className="live-feed">
      <div className="live-header"><div className="live-blink"></div> Live activity</div>
      <div className="feed-items">
        {items.map((e, i) => (
          <div key={i + e.text} className="feed-item">
            <div className="feed-avatar" style={{ background: e.bg, color: e.tc }}>{e.initials}</div>
            <div className="feed-info">
              <p>{e.text}</p>
              <span>{e.time}</span>
              <div className="feed-badge" style={{ background: e.bbg, color: e.btc }}>{e.badge}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
