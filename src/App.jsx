import React, { useState, useEffect } from 'react';
import { Heart, Share2, LogOut, BookOpen, Settings, Search, Check, Copy, ChevronDown, Calendar, Sparkles } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

// ---------- Firebase ----------
const firebaseConfig = {
  apiKey: "AIzaSyAbknRkscPA1kcXXKN0EXXLtVugryHOUvE",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.firebasestorage.app",
  messagingSenderId: "512606494351",
  appId: "1:512606494351:web:bec63c73473e3e68de9afa",
  measurementId: "G-KFTS1N2RGX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Theme images (direct Unsplash CDN - no API key needed, always works) ----------
const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const THEME_IMAGES = {
  hope:        IMG('photo-1470252649378-9c29740c9fa8'), // golden sunrise field
  future:      IMG('photo-1470252649378-9c29740c9fa8'),
  trust:       IMG('photo-1469474968028-56623f02e42e'), // sunbeam over mountains
  faith:       IMG('photo-1469474968028-56623f02e42e'),
  confidence:  IMG('photo-1469474968028-56623f02e42e'),
  love:        IMG('photo-1490750967868-88aa4486c946'), // soft flowers
  grace:       IMG('photo-1490750967868-88aa4486c946'),
  kindness:    IMG('photo-1490750967868-88aa4486c946'),
  prayer:      IMG('photo-1470071459604-3b5ec3a7fe05'), // misty dawn hills
  calling:     IMG('photo-1470071459604-3b5ec3a7fe05'),
  rest:        IMG('photo-1507525428034-b723cf961d3e'), // calm beach
  renewal:     IMG('photo-1507525428034-b723cf961d3e'),
  restoration: IMG('photo-1506744038136-46273834b3fb'), // still mountain lake
  healing:     IMG('photo-1506744038136-46273834b3fb'),
  strength:    IMG('photo-1464822759023-fed622ff2c3b'), // grand mountain range
  power:       IMG('photo-1464822759023-fed622ff2c3b'),
  protection:  IMG('photo-1464822759023-fed622ff2c3b'),
  word:        IMG('photo-1441974231531-c6227db76b6e'), // light through forest
  wisdom:      IMG('photo-1441974231531-c6227db76b6e'),
  knowledge:   IMG('photo-1441974231531-c6227db76b6e'),
  darkness:    IMG('photo-1519681393784-d120267933ba'), // starry mountain night
  trouble:     IMG('photo-1519681393784-d120267933ba'),
  exile:       IMG('photo-1519681393784-d120267933ba')
};

const FALLBACK_IMAGES = [
  IMG('photo-1501785888041-af3ef285b470'), // mountain lake sunset
  IMG('photo-1470252649378-9c29740c9fa8'),
  IMG('photo-1441974231531-c6227db76b6e'),
  IMG('photo-1469474968028-56623f02e42e'),
  IMG('photo-1506744038136-46273834b3fb')
];

function imageForVerse(verse) {
  if (verse.tags && verse.tags.length) {
    for (const tag of verse.tags) {
      const key = String(tag).toLowerCase();
      if (THEME_IMAGES[key]) return THEME_IMAGES[key];
    }
  }
  const idx = (Number(verse.id) || verse.chapter || 0) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

// ---------- Main App ----------
export default function DailyWisdomApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [verses, setVerses] = useState([]);
  const [todayVerse, setTodayVerse] = useState(null);
  const [userPrefs, setUserPrefs] = useState({ notificationsEnabled: true });
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserPrefs(data.preferences || { notificationsEnabled: true });
            setSubscribed(data.subscribed === true);
          }
        } catch (e) { /* non-critical */ }
        await loadVerses();
        setPage('home');
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadVerses = async () => {
    try {
      const snap = await getDocs(collection(db, 'verses'));
      const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      loaded.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      setVerses(loaded);

      const today = new Date().toISOString().split('T')[0];
      // Pick today's verse, else rotate by day-of-year so it changes daily
      let pick = loaded.find(v => v.date === today);
      if (!pick && loaded.length) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        pick = loaded[dayOfYear % loaded.length];
      }
      setTodayVerse(pick || null);
    } catch (e) {
      console.error('Error loading verses:', e);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  const handleSubscribe = async () => {
    setSubscribed(true);
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { subscribed: true }, { merge: true });
      } catch (e) { console.error(e); }
    }
    setPage('archive');
  };

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <AuthPage />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-0)' }}>
      {page === 'home' && (todayVerse
        ? <TodayView verse={todayVerse} onOpenSettings={() => setPage('settings')} />
        : <EmptyState />)}
      {page === 'archive' && (subscribed
        ? <ArchiveView verses={verses} />
        : <SubscribeView onSubscribe={handleSubscribe} />)}
      {page === 'subscribe' && <SubscribeView onSubscribe={handleSubscribe} />}
      {page === 'settings' && <SettingsView userPrefs={userPrefs} setUserPrefs={setUserPrefs} onLogout={handleLogout} subscribed={subscribed} onSubscribe={handleSubscribe} />}

      <BottomNav page={page} setPage={setPage} subscribed={subscribed} />
    </div>
  );
}

// ---------- Bottom Navigation ----------
function BottomNav({ page, setPage, subscribed }) {
  const items = subscribed
    ? [
        { key: 'home', label: 'Today', icon: BookOpen },
        { key: 'archive', label: 'Archive', icon: Search }
      ]
    : [
        { key: 'home', label: 'Today', icon: BookOpen },
        { key: 'subscribe', label: 'Subscribe', icon: Sparkles }
      ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 22px'
    }}>
      {items.map(({ key, label, icon: Icon }) => {
        const active = page === key;
        return (
          <button key={key} onClick={() => setPage(key)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: active ? '#B8860B' : '#8a8a8a',
            fontSize: 12, fontWeight: active ? 600 : 500, minWidth: 76
          }}>
            <Icon size={24} strokeWidth={active ? 2.4 : 2} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ---------- Today (hero image + overlay text) ----------
function TodayView({ verse, onOpenSettings }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const heroImg = imageForVerse(verse);

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const copyVerse = () => {
    const text = `"${verse.text}"\n— Jeremiah ${verse.chapter}:${verse.verse}\n\nReflection: ${verse.reflection}\n\nWellness tip: ${verse.wellnessTip}\n\nDaily Wisdom from Jeremiah`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVerse = async () => {
    const text = `"${verse.text}" — Jeremiah ${verse.chapter}:${verse.verse}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Daily Wisdom from Jeremiah', text, url: window.location.href }); } catch (e) { /* cancelled */ }
    } else {
      copyVerse();
    }
  };

  return (
    <div style={{ paddingBottom: 110 }}>
      {/* HERO */}
      <div style={{ position: 'relative', height: '72vh', minHeight: 520, overflow: 'hidden' }}>
        <img src={heroImg} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'
        }} />
        {/* Strong gradient for text contrast */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.85) 100%)'
        }} />

        {/* Centered header: title, promise subheading, date */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '26px 20px 0', textAlign: 'center', color: '#fff'
        }}>
          <h1 style={{
            margin: 0,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 30, fontWeight: 700, letterSpacing: 0.5,
            textShadow: '0 2px 12px rgba(0,0,0,0.75)'
          }}>
            Daily Wisdom
          </h1>
          <p style={{
            margin: '8px 0 0', fontSize: 14.5, fontWeight: 500,
            letterSpacing: 0.4, opacity: 0.95, lineHeight: 1.5,
            textShadow: '0 1px 8px rgba(0,0,0,0.75)'
          }}>
            A verse · a reflection · a wellness practice
            <br />
            <span style={{ fontSize: 13, opacity: 0.85 }}>every day, from the Book of Jeremiah</span>
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
            backgroundColor: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 14px',
            fontSize: 12.5, fontWeight: 500
          }}>
            <Calendar size={13} />
            {dateLabel}
          </div>
        </div>

        {/* Verse text overlay */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '0 24px 34px', textAlign: 'center', color: '#ffffff'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(184,134,11,0.95)',
            borderRadius: 999, padding: '6px 16px',
            fontSize: 13, fontWeight: 700, letterSpacing: 1.2,
            textTransform: 'uppercase', marginBottom: 18
          }}>
            Jeremiah {verse.chapter}:{verse.verse}
          </div>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 22, lineHeight: 1.65, fontWeight: 500,
            margin: 0,
            textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)'
          }}>
            “{verse.text}”
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center',
        padding: '18px 20px 4px'
      }}>
        <ActionButton onClick={() => setLiked(!liked)} active={liked} activeColor="#c0392b"
          icon={<Heart size={18} fill={liked ? 'currentColor' : 'none'} />} label={liked ? 'Loved' : 'Love'} />
        <ActionButton onClick={copyVerse} active={copied} activeColor="#1e7e34"
          icon={copied ? <Check size={18} /> : <Copy size={18} />} label={copied ? 'Copied' : 'Copy'} />
        <ActionButton onClick={shareVerse} icon={<Share2 size={18} />} label="Share" />
      </div>

      {/* REFLECTION */}
      <section style={{
        margin: '18px 16px 0', padding: '22px 22px',
        backgroundColor: 'var(--surface-2)',
        borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{
          margin: '0 0 10px', fontSize: 13, fontWeight: 700,
          letterSpacing: 1.4, textTransform: 'uppercase', color: '#B8860B'
        }}>
          Today’s reflection
        </h3>
        <p style={{
          margin: 0, fontSize: 16.5, lineHeight: 1.75, color: 'var(--text-primary)'
        }}>
          {verse.reflection}
        </p>
      </section>

      {/* WELLNESS TIP */}
      <section style={{
        margin: '14px 16px 0', padding: '22px 22px',
        background: 'linear-gradient(135deg, #f0f7f0 0%, #e6f3ea 100%)',
        borderRadius: 20, border: '1px solid rgba(30,126,52,0.18)'
      }}>
        <h3 style={{
          margin: '0 0 10px', fontSize: 13, fontWeight: 700,
          letterSpacing: 1.4, textTransform: 'uppercase', color: '#1e7e34',
          display: 'flex', alignItems: 'center', gap: 7
        }}>
          <Sparkles size={15} /> Wellness practice
        </h3>
        <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.75, color: '#14421f' }}>
          {verse.wellnessTip}
        </p>
      </section>

      {/* Subtle settings link - intentionally low-key */}
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <button onClick={onOpenSettings} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, padding: 8
        }}>
          <Settings size={15} /> Settings
        </button>
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, active, activeColor }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 22px', borderRadius: 999,
      border: '1px solid rgba(0,0,0,0.1)',
      backgroundColor: active ? '#fff' : 'var(--surface-2)',
      color: active ? (activeColor || '#B8860B') : 'var(--text-primary)',
      fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    }}>
      {icon}{label}
    </button>
  );
}

// ---------- Subscribe ----------
function SubscribeView({ onSubscribe }) {
  return (
    <div style={{
      minHeight: '78vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '30px 20px 130px'
    }}>
      <div style={{
        width: '100%', maxWidth: 420, textAlign: 'center',
        backgroundColor: 'var(--surface-2)', borderRadius: 24,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        padding: '36px 26px'
      }}>
        <div style={{
          width: 66, height: 66, margin: '0 auto 18px', borderRadius: 20,
          backgroundColor: '#B8860B', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Sparkles size={30} color="#fff" />
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Unlock the full archive
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
          Subscribe to browse every passage — 40 verses from Jeremiah,
          each with its reflection and wellness practice, beautifully illustrated.
        </p>
        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 0 26px',
          textAlign: 'left', display: 'inline-block'
        }}>
          {['Full 40-verse archive', 'Search by word or chapter', 'Daily verse each morning'].map(item => (
            <li key={item} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 15, color: 'var(--text-primary)', padding: '6px 0'
            }}>
              <Check size={17} style={{ color: '#1e7e34', flexShrink: 0 }} /> {item}
            </li>
          ))}
        </ul>
        <button onClick={onSubscribe} style={{
          width: '100%', padding: '15px 0',
          backgroundColor: '#B8860B', color: '#fff', border: 'none',
          borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer'
        }}>
          Subscribe — it's free
        </button>
        <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
          No payment needed. Unsubscribe anytime in Settings.
        </p>
      </div>
    </div>
  );
}

// ---------- Archive ----------
function ArchiveView({ verses }) {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const filtered = verses.filter(v =>
    (v.text || '').toLowerCase().includes(q.toLowerCase()) ||
    (v.reflection || '').toLowerCase().includes(q.toLowerCase()) ||
    String(v.chapter).includes(q)
  );

  return (
    <div style={{ padding: '22px 16px 120px', maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
        Verse archive
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 14.5, color: 'var(--text-secondary)' }}>
        {verses.length} passages from the Book of Jeremiah
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        backgroundColor: 'var(--surface-2)', border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 14, padding: '12px 16px', marginBottom: 18
      }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by word or chapter…"
          style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: 15.5 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(v => {
          const open = openId === v.id;
          return (
            <article key={v.id} onClick={() => setOpenId(open ? null : v.id)} style={{
              backgroundColor: 'var(--surface-2)', borderRadius: 18,
              border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
            }}>
              <div style={{ position: 'relative', height: 130 }}>
                <img src={imageForVerse(v)} alt="" loading="lazy" style={{
                  width: '100%', height: '100%', objectFit: 'cover'
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
                }} />
                <span style={{
                  position: 'absolute', left: 14, bottom: 12,
                  backgroundColor: 'rgba(184,134,11,0.95)', color: '#fff',
                  borderRadius: 999, padding: '4px 12px',
                  fontSize: 12, fontWeight: 700, letterSpacing: 1
                }}>
                  JEREMIAH {v.chapter}:{v.verse}
                </span>
                <ChevronDown size={20} style={{
                  position: 'absolute', right: 14, bottom: 12, color: '#fff',
                  transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s'
                }} />
              </div>
              <div style={{ padding: '14px 18px 16px' }}>
                <p style={{
                  margin: 0, fontFamily: "Georgia, serif",
                  fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-primary)',
                  fontStyle: 'italic'
                }}>
                  “{open ? v.text : (v.text.length > 110 ? v.text.slice(0, 110) + '…' : v.text)}”
                </p>
                {open && (
                  <>
                    <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {v.reflection}
                    </p>
                    <p style={{
                      margin: '12px 0 0', padding: '12px 14px',
                      backgroundColor: '#eef6f0', borderRadius: 12,
                      fontSize: 14, lineHeight: 1.65, color: '#14421f'
                    }}>
                      ✨ {v.wellnessTip}
                    </p>
                  </>
                )}
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2.5rem 0' }}>
            No verses match your search.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Settings ----------
function SettingsView({ userPrefs, setUserPrefs, onLogout, subscribed, onSubscribe }) {
  const toggle = async () => {
    const next = { ...userPrefs, notificationsEnabled: !userPrefs.notificationsEnabled };
    setUserPrefs(next);
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { preferences: next });
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div style={{ padding: '22px 16px 120px', maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 18px', color: 'var(--text-primary)' }}>
        Settings
      </h2>

      <div style={{
        backgroundColor: 'var(--surface-2)', borderRadius: 18,
        border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>Subscription</p>
            <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>
              {subscribed ? 'Active — full archive unlocked' : 'Not subscribed'}
            </p>
          </div>
          {subscribed ? (
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#1e7e34',
              backgroundColor: '#e6f3ea', borderRadius: 999, padding: '6px 14px'
            }}>
              Active
            </span>
          ) : (
            <button onClick={onSubscribe} style={{
              fontSize: 13.5, fontWeight: 700, color: '#fff',
              backgroundColor: '#B8860B', border: 'none',
              borderRadius: 999, padding: '9px 18px', cursor: 'pointer'
            }}>
              Subscribe
            </button>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>Daily notifications</p>
            <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--text-secondary)' }}>
              Receive the daily verse each morning
            </p>
          </div>
          <button onClick={toggle} aria-label="Toggle notifications" style={{
            width: 52, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
            backgroundColor: userPrefs.notificationsEnabled ? '#1e7e34' : '#cfcfcf',
            position: 'relative', transition: 'background-color .2s'
          }}>
            <span style={{
              position: 'absolute', top: 3,
              left: userPrefs.notificationsEnabled ? 25 : 3,
              width: 24, height: 24, borderRadius: '50%',
              backgroundColor: '#fff', transition: 'left .2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
            }} />
          </button>
        </div>

        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 20px', background: 'transparent', border: 'none',
          cursor: 'pointer', fontSize: 15.5, fontWeight: 600, color: '#c0392b'
        }}>
          <LogOut size={18} /> Sign out
        </button>
      </div>

      <p style={{
        textAlign: 'center', marginTop: 26, fontSize: 13,
        color: 'var(--text-muted)', lineHeight: 1.6
      }}>
        Daily Wisdom from Jeremiah<br />
        Ancient words for modern resilience
      </p>
    </div>
  );
}

// ---------- Auth ----------
function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email,
          createdAt: new Date(),
          preferences: { notificationsEnabled: true },
          subscribed: false,
          isAdmin: false
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msg = String(e.code || e.message || '');
      if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setError('Email or password is incorrect.');
      } else if (msg.includes('email-already-in-use')) {
        setError('This email already has an account. Try signing in.');
      } else if (msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <img src={THEME_IMAGES.hope} alt="" style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover'
      }} />
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)'
      }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 400,
        backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 24,
        padding: '34px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 14px', borderRadius: 20,
            backgroundColor: '#B8860B', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={30} color="#fff" />
          </div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: '#1a1a1a' }}>
            Daily Wisdom
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#666' }}>
            Ancient words for modern resilience
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fdeaea', border: '1px solid #f2b8b8',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            fontSize: 14, color: '#9c2020'
          }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#333', marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#333', margin: '14px 0 6px' }}>
          Password
        </label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          style={inputStyle}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        />

        <button onClick={submit} disabled={busy} style={{
          width: '100%', marginTop: 22, padding: '14px 0',
          backgroundColor: '#B8860B', color: '#fff', border: 'none',
          borderRadius: 14, fontSize: 15.5, fontWeight: 700,
          cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1
        }}>
          {busy ? 'One moment…' : (isSignUp ? 'Create account' : 'Sign in')}
        </button>

        <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} style={{
          width: '100%', marginTop: 12, padding: '12px 0',
          background: 'transparent', color: '#B8860B',
          border: '1.5px solid #B8860B', borderRadius: 14,
          fontSize: 14.5, fontWeight: 600, cursor: 'pointer'
        }}>
          {isSignUp ? 'I already have an account' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '13px 15px', fontSize: 15.5,
  border: '1.5px solid #ddd', borderRadius: 12,
  outline: 'none', backgroundColor: '#fafafa'
};

// ---------- Empty & Loading ----------
function EmptyState() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: 14 }} />
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>
        No verses found yet. Please check back soon.
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#faf8f4' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 60, height: 60, margin: '0 auto 16px', borderRadius: 18,
          backgroundColor: '#B8860B', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <BookOpen size={28} color="#fff" />
        </div>
        <p style={{ color: '#8a8a8a', fontSize: 14.5, margin: 0 }}>Loading Daily Wisdom…</p>
      </div>
    </div>
  );
}
