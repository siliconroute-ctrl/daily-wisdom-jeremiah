import React, { useState, useEffect } from 'react';
import { Heart, Share2, LogOut, BookOpen, Settings, Shield, Search, Bell, Mail, Check } from 'lucide-react';

// ====== FIREBASE SETUP ======
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
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Your Firebase configuration (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAbknRkscPA1kcXXKN0EXXLtVugryHOUvE",
  authDomain: "daily-wisdom-jeremiah.firebaseapp.com",
  projectId: "daily-wisdom-jeremiah",
  storageBucket: "daily-wisdom-jeremiah.firebasestorage.app",
  messagingSenderId: "512606494351",
  appId: "1:512606494351:web:bec63c73473e3e68de9afa",
  measurementId: "G-KFTS1N2RGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ====== MAIN APP ======
export default function DailyWisdomApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('auth');
  const [loading, setLoading] = useState(true);
  const [verses, setVerses] = useState([]);
  const [todayVerse, setTodayVerse] = useState(null);
  const [userPrefs, setUserPrefs] = useState({ notificationsEnabled: true });
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Check if admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.isAdmin || false);
          setUserPrefs(userData.preferences || { notificationsEnabled: true });
        }
        
        // Load verses
        await loadVerses();
        setPage('home');
      } else {
        setCurrentUser(null);
        setPage('auth');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load verses from Firestore
  const loadVerses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'verses'));
      const loadedVerses = [];
      querySnapshot.forEach((doc) => {
        loadedVerses.push({ id: doc.id, ...doc.data() });
      });
      setVerses(loadedVerses);
      
      // Get today's verse
      const today = new Date().toISOString().split('T')[0];
      const todayVerse = loadedVerses.find(v => v.date === today) || loadedVerses[0];
      setTodayVerse(todayVerse);
    } catch (error) {
      console.error('Error loading verses:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div style={{ backgroundColor: 'var(--surface-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '0.5px solid var(--border)',
        padding: '1rem 1.5rem',
        backgroundColor: 'var(--surface-2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Daily Wisdom from Jeremiah
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {currentUser?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setPage('settings')}
            style={headerButtonStyle}
          >
            <Bell size={16} /> Notify
          </button>
          <button 
            onClick={() => setPage('settings')}
            style={headerButtonStyle}
          >
            <Settings size={16} /> Settings
          </button>
          {isAdmin && (
            <button 
              onClick={() => setPage('admin')}
              style={headerButtonStyle}
            >
              <Shield size={16} /> Admin
            </button>
          )}
          <button 
            onClick={handleLogout}
            style={{...headerButtonStyle, color: 'var(--text-secondary)'}}
          >
            <LogOut size={16} /> Exit
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        gap: '0',
        backgroundColor: 'var(--surface-2)',
        padding: '0 1.5rem'
      }}>
        {['home', 'archive'].map(tab => (
          <button
            key={tab}
            onClick={() => setPage(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: page === tab ? '2px solid var(--fill-accent)' : 'transparent',
              padding: '12px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: page === tab ? 500 : 400,
              color: page === tab ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            {tab === 'home' ? 'Today' : 'Archive'}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {page === 'home' && todayVerse && <TodayVerseView verse={todayVerse} />}
        {page === 'archive' && <ArchiveView verses={verses} />}
        {page === 'settings' && <SettingsView userPrefs={userPrefs} setUserPrefs={setUserPrefs} />}
        {page === 'admin' && isAdmin && <AdminPanel verses={verses} onVerseAdded={loadVerses} />}
      </div>
    </div>
  );
}

// ====== AUTH PAGE ======
function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email: email,
          createdAt: new Date(),
          preferences: { notificationsEnabled: true },
          subscribed: true,
          isAdmin: false
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface-0)',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📖</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 500 }}>
            Daily Wisdom from Jeremiah
          </h1>
          <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Ancient words for modern resilience
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--bg-danger)',
            border: '0.5px solid var(--border-danger)',
            borderRadius: 'var(--radius)',
            padding: '12px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: 'var(--text-danger)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--fill-accent)',
              color: 'var(--on-accent)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create account' : 'Sign in')}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              color: 'var(--text-accent)',
              border: '0.5px solid var(--border-accent)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Already have an account?' : 'Create account instead'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ====== TODAY'S VERSE VIEW ======
function TodayVerseView({ verse }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const copyToClipboard = () => {
    const text = `"${verse.text}"\n\nJeremiah ${verse.chapter}:${verse.verse}\n\nReflection: ${verse.reflection}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Daily Wisdom: Jeremiah ${verse.chapter}:${verse.verse}`,
        text: verse.text,
        url: window.location.href
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Main Verse Card */}
      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          fontWeight: 500
        }}>
          Today's reading • {new Date().toLocaleDateString()}
        </p>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          margin: '0 0 1.5rem',
          fontStyle: 'italic'
        }}>
          "{verse.text}"
        </p>

        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: '0',
          fontWeight: 500
        }}>
          Jeremiah {verse.chapter}:{verse.verse}
        </p>
      </div>

      {/* Reflection */}
      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          margin: '0 0 12px',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <BookOpen size={16} /> Reflection
        </h3>
        <p style={{
          margin: '0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--text-primary)'
        }}>
          {verse.reflection}
        </p>
      </div>

      {/* Wellness Tip */}
      <div style={{
        backgroundColor: 'var(--bg-success)',
        border: '0.5px solid var(--border-success)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{
          margin: '0 0 12px',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-success)'
        }}>
          Wellness tip for today
        </h3>
        <p style={{
          margin: '0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--text-success)'
        }}>
          {verse.wellnessTip}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setLiked(!liked)}
          style={{
            ...actionButtonStyle,
            backgroundColor: liked ? 'var(--bg-danger)' : 'var(--surface-2)'
          }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} style={{ color: liked ? 'var(--fill-danger)' : 'inherit' }} />
          {liked ? 'Liked' : 'Like'}
        </button>
        <button
          onClick={copyToClipboard}
          style={actionButtonStyle}
        >
          {copied ? <Check size={16} /> : <Mail size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={handleShare}
          style={actionButtonStyle}
        >
          <Share2 size={16} /> Share
        </button>
      </div>
    </div>
  );
}

// ====== ARCHIVE VIEW ======
function ArchiveView({ verses }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = verses.filter(v =>
    v.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.reflection.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.chapter.toString().includes(searchQuery)
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--surface-2)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 12px'
        }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by chapter, verse, or content..."
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              backgroundColor: 'transparent',
              fontSize: '14px'
            }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No verses found. Try a different search.
          </p>
        ) : (
          filtered.map(verse => (
            <div
              key={verse.id}
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: '0 0 8px',
                fontWeight: 500
              }}>
                Jeremiah {verse.chapter}:{verse.verse}
              </p>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                margin: '0 0 12px',
                fontStyle: 'italic'
              }}>
                "{verse.text}"
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: '0',
                lineHeight: '1.5'
              }}>
                {verse.reflection}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ====== SETTINGS VIEW ======
function SettingsView({ userPrefs, setUserPrefs }) {
  const handleToggle = async () => {
    const newPrefs = { ...userPrefs, notificationsEnabled: !userPrefs.notificationsEnabled };
    setUserPrefs(newPrefs);
    
    // Update in Firestore
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        preferences: newPrefs
      });
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface-2)',
      border: '0.5px solid var(--border)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '18px', fontWeight: 500 }}>
        Settings
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '1rem',
        borderBottom: '0.5px solid var(--border)'
      }}>
        <div>
          <p style={{ margin: '0', fontSize: '14px', fontWeight: 500 }}>
            Daily email notifications
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Receive verses at 7:00 AM daily
          </p>
        </div>
        <input
          type="checkbox"
          checked={userPrefs.notificationsEnabled}
          onChange={handleToggle}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-success)',
        borderRadius: 'var(--radius)',
        border: '0.5px solid var(--border-success)'
      }}>
        <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-success)' }}>
          ✓ Preferences saved. You'll receive verses via email and in-app notifications.
        </p>
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid var(--border)' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Account: {auth.currentUser?.email}
        </p>
      </div>
    </div>
  );
}

// ====== ADMIN PANEL ======
function AdminPanel({ verses, onVerseAdded }) {
  const [newVerse, setNewVerse] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddVerse = async () => {
    if (!newVerse.trim()) return;

    setSaving(true);
    try {
      // Parse input: chapter:verse|text|reflection|wellness-tip|date
      const parts = newVerse.split('|');
      const [chapterVerse] = parts[0].split(':');
      const [chapter, verse] = chapterVerse.split(':');

      const verseData = {
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        text: parts[1]?.trim() || '',
        reflection: parts[2]?.trim() || '',
        wellnessTip: parts[3]?.trim() || '',
        date: parts[4]?.trim() || new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        likes: 0,
        shares: 0
      };

      // Save to Firestore
      await setDoc(doc(db, 'verses', `${chapter}-${verse}`), verseData);
      
      setNewVerse('');
      onVerseAdded();
    } catch (error) {
      console.error('Error adding verse:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: '18px', fontWeight: 500 }}>
        Admin Dashboard
      </h2>

      <div style={{
        backgroundColor: 'var(--surface-2)',
        border: '0.5px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '15px', fontWeight: 500 }}>
          Add new verse
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Format: chapter:verse|text|reflection|wellness-tip|date
        </p>
        <textarea
          placeholder="29:11|For I know the plans I have for you...|In times of uncertainty...|Take 5 minutes to journal...|2026-03-01"
          value={newVerse}
          onChange={(e) => setNewVerse(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '13px',
            boxSizing: 'border-box',
            minHeight: '100px',
            marginBottom: '1rem',
            fontFamily: 'monospace'
          }}
        />
        <button
          onClick={handleAddVerse}
          disabled={saving}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--fill-accent)',
            color: 'var(--on-accent)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Add verse'}
        </button>
      </div>

      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '15px', fontWeight: 500 }}>
          Verses in system ({verses.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {verses.slice(0, 10).map(verse => (
            <div
              key={verse.id}
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ margin: '0', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Jeremiah {verse.chapter}:{verse.verse}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
                  {verse.text.substring(0, 40)}...
                </p>
              </div>
              <button style={{
                padding: '6px 12px',
                backgroundColor: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== LOADING SCREEN ======
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface-0)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
          📖
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Loading Daily Wisdom...
        </p>
      </div>
    </div>
  );
}

// ====== STYLES ======
const headerButtonStyle = {
  background: 'transparent',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  color: 'var(--text-primary)'
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  marginBottom: '6px',
  color: 'var(--text-primary)'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '14px',
  boxSizing: 'border-box',
  backgroundColor: 'var(--surface-1)'
};

const actionButtonStyle = {
  padding: '10px 16px',
  backgroundColor: 'var(--surface-2)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};


