// src/components/MainTest.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button, Input, notification, Grid } from 'antd';
import {
  PlusOutlined,
  BarChartOutlined,
  ShareAltOutlined,
  BulbOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { ThemeContext } from '../ThemeContext';

const { useBreakpoint } = Grid;

// Queen's-themed questions
const questions = [
  "Skipped class to explore Kingston’s nightlife?",
  "Partied till dawn in a Queen’s dorm?",
  "Stolen a kiss under the historic arches on campus?",
  "Taken part in a wild Frosh Week escapade?",
  "Dared to go skinny dipping in a nearby lake?",
  "Hooked up in a Queen’s study lounge?",
  "Pulled an all-nighter at the Lister Library?",
  "Been caught sneaking into a late-night campus party?",
  "Flirted with someone from a different faculty?",
  "Joined a secret society (or rumor thereof) on campus?",
  "Partied with the Engineering crew until dawn?",
  "Been seduced by an Arts and Science classmate?",
  "Shared a scandalous kiss with a Smith School of Business student?",
  "Taken a risky dare from a Health Sciences major?",
  "Had a forbidden fling with a Law student?",
  "Dated someone from the Education faculty just for the thrill?",
  "Gotten lost on campus chasing a late-night thrill?",
  "Been part of a campus scandal that left you speechless?",
  "Pulled a prank during a Queen’s Homecoming?",
  "Had a secret romance that defied campus rules?",
  "Experimented with your sexuality during Frosh Week?",
  "Partied so hard you forgot you were a Queen’s Lancer?",
  "Had a rendezvous in one of Queen’s old, secretive halls?",
  "Played hook-up games in the Queen’s quad?",
  "Been busted by a professor for breaking curfew?",
  "Experienced unrestrained passion in a Queen’s dorm room?",
  "Embarked on a scandalous late-night rendezvous?",
  "Shared an intimate secret during a campus blackout?",
  "Shamelessly flirted at a Queen’s party?",
  "Sent a risqué text in the middle of a lecture?",
  "Snuck into a club on campus in outrageous attire?",
  "Accepted a naughty dare from your housemates?",
  "Been dared to do something wild at a Queen’s bash?",
  "Had a spontaneous, dirty encounter on campus grounds?",
  "Had a secret tryst in the back of a campus bar?",
  "Confessed a scandalous secret after one too many drinks?",
  "Joined a racy campus scavenger hunt?",
  "Taken part in a forbidden hookup tradition at Queen’s?",
  "Had a passionate night that left you red-faced on campus?",
  "Broken a rule just to score a quick romance?",
  "Flirted while waiting in a Queen’s dining hall line?",
  "Gotten wild during a Queen’s football game night?",
  "Been swept up in an impromptu campus make-out session?",
  "Shared a steamy secret with your lab partner?",
  "Sparked a romance in the arts building?",
  "Played truth or dare that went way over the top at Queen’s?",
  "Had a compromising moment in the student union?",
  "Been caught in a scandalous study group encounter?",
  "Had a wild escapade in the heart of Kingston?",
  "Partied with the Smith School of Business crew in a memorable way?",
  "Flirted with someone from Engineering after class?",
  "Found yourself in a messy campus love triangle?",
  "Added a risqué twist to a Queen’s seminar break?",
  "Stolen a kiss during a campus tradition event?",
  "Attended a secret underground party in a Queen’s cellar?",
  "Let a heated debate end in unexpected passion?",
  "Partied so hard that you forgot your own name?",
  "Played a dirty game of spin the bottle at Queen’s?",
  "Exchanged scandalous secrets with a stranger at a campus event?",
  "Experienced a night that defied Queen’s expectations?",
  "Dared to push your limits at a Queen’s house party?",
  "Spiced up a study session with flirtatious banter?",
  "Been haunted by a scandal from your Queen’s days?",
  "Flirted outrageously with a guest at a campus event?",
  "Starred in your own legendary Queen’s love story?",
  "Been swept away by a spontaneous campus romance?",
  "Taken a naughty risk to impress someone in class?",
  "Had a heated encounter in a Queen’s lecture hall?",
  "Broken the ice with a daring dorm dare?",
  "Whispered dirty secrets in a quiet campus corner?",
  "Had a hookup that defied all campus expectations?",
  "Joined a racy secret society initiation at Queen’s?",
  "Made out in an unexpected spot on campus?",
  "Been caught red-handed during a cheeky escapade?",
  "Had an encounter that became a campus legend?",
  "Transformed a Queen’s event into a naughty adventure?",
  "Flirted just to break the ice at Frosh Week?",
  "Indulged in a secret rendezvous in a hidden nook?",
  "Experienced an all-nighter that turned wildly unexpected?",
  "Exchanged flirtatious texts during a boring lecture?",
  "Played a risky game of truth or dare that got too personal?",
  "Taken a scandalous selfie that left you blushing the next day?",
  "Embarked on a midnight adventure that defied Queen’s rules?",
  "Made a bet that led to a wild, unforgettable night?",
  "Been part of a racy campus prank that went viral?",
  "Danced dangerously close to scandal at a Queen’s party?",
  "Had a secret encounter you still keep hidden?",
  "Flirted shamelessly in the Queen’s quad?",
  "Used your Queen’s ID for a wild campus dare?",
  "Been part of a night that turned into an unexpected escapade?",
  "Broken free from your comfort zone at a Queen’s bash?",
  "Played a naughty game that got a little too real?",
  "Found yourself in a scandalous situation you couldn’t explain?",
  "Had an encounter that still makes you blush?",
  "Taken part in a racy Queen’s tradition you’d never admit to?",
  "Indulged in secretive flirtation during a campus event?",
  "Felt the thrill of a taboo kiss on Queen’s grounds?",
  "Taken a daring chance that led to a messy love affair?",
  "Crossed the line between fun and scandal at Queen’s?",
  "Written your own scandalous chapter in the Queen’s legacy?"
];

// Helper for random float in [min, max]
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Emojis to spawn
const floatingEmojis = [
  '🎉','🔥','🌈','🤩','🎈','👑','🍀','✨','🦄','🍕','🍻','🎂','🌟','🤟','💃','🕺'
];

function MainTest() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Use a solid background color based on theme.
  const containerBackground = theme === 'light' ? '#f0f2f5' : '#121212';

  // Update HTML and body background to match container background.
  useEffect(() => {
    document.documentElement.style.backgroundColor = containerBackground;
    document.body.style.backgroundColor = containerBackground;
  }, [containerBackground]);

  // Answers and age
  const [answers, setAnswers] = useState(Array(questions.length).fill(false));
  const [age, setAge] = useState('');

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State array of floating emojis
  const [emojiArray, setEmojiArray] = useState([]);

  // Interval ref to clear on unmount
  const spawnIntervalRef = useRef(null);

  // Spawns a single emoji with random data.
  function spawnEmoji() {
    const id = Date.now() + Math.random();
    const emoji = floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
    const topPos = randomInRange(0, 80);
    const leftPos = randomInRange(0, 80);
    const dx = randomInRange(-100, 100);
    const dy = randomInRange(-100, 100);
    const size = randomInRange(1.5, 3);
    const duration = randomInRange(5, 10); // seconds
    const newEmoji = { id, emoji, topPos, leftPos, dx, dy, size, duration };
    setEmojiArray((prev) => [...prev, newEmoji]);
  }

  // Remove emoji after animation finishes.
  function removeEmoji(id) {
    setEmojiArray((prev) => prev.filter((item) => item.id !== id));
  }

  useEffect(() => {
    spawnEmoji();
    spawnIntervalRef.current = setInterval(() => {
      const spawnCount = Math.floor(randomInRange(2, 5));
      for (let i = 0; i < spawnCount; i++) {
        spawnEmoji();
      }
    }, 2000);
    return () => clearInterval(spawnIntervalRef.current);
  }, []);

  // Toggle a checkbox.
  const handleToggle = (index) => {
    const newAnswers = [...answers];
    newAnswers[index] = !newAnswers[index];
    setAnswers(newAnswers);
  };

  // Clear all boxes.
  const handleClearAll = () => {
    setAnswers(Array(questions.length).fill(false));
  };

  // Submit form.
  const handleSubmit = async () => {
    const score = answers.filter((answer) => answer).length;
    const ageNumber = parseInt(age, 10);
    const validAge = !isNaN(ageNumber) ? ageNumber : null;
    await addDoc(collection(db, 'mainTestResults'), {
      score,
      age: validAge,
      timestamp: serverTimestamp(),
    });
    navigate('/results');
  };

  // Navigation handlers.
  const handleCreateTest = () => navigate('/create');
  const handleViewStats = () => navigate('/results');
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notification.success({
        message: 'Link Copied!',
        description: 'The link to this page has been copied to your clipboard.',
      });
    } catch (err) {
      notification.error({
        message: 'Failed to Copy',
        description: 'Please copy the URL manually.',
      });
    }
  };

  // Mobile menu open/close.
  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);

  // -- STYLES --
  const containerStyle = {
    background: containerBackground,
    minHeight: '100vh',
    width: '100%',
    padding: '0 15px',
    boxSizing: 'border-box',
    fontFamily: 'Georgia, serif',
    color: theme === 'light' ? '#000' : '#fff',
    transition: 'color 0.3s ease, background 0.3s ease',
    position: 'relative',
    marginTop: screens.xs ? -90 : 5,
    fontSize: '1.1rem',
  };

  const emojiLayerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  };

  const contentStyle = {
    maxWidth: '800px',
    margin: '100px auto 40px auto',
    backgroundColor:
      theme === 'light'
        ? 'rgba(255,255,255,0.85)'
        : 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(3px)',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    transition: 'background-color 0.3s ease',
    position: 'relative',
    zIndex: 1,
  };

  const buttonRowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '20px',
  };

  // Updated dock overlay style (desktop menu bar always visible)
  const dockOverlayStyle = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    padding: '10px 30px',
    borderRadius: '20px',
    backdropFilter: 'blur(4px)',
    display: screens.xs ? 'none' : 'flex',
    gap: '12px',
    zIndex: 100,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const dockButtonStyle = {
    backgroundColor: 'transparent',
    border: '1px solid',
    color: theme === 'light' ? '#000' : '#fff',
    fontWeight: 'bold',
    borderColor: theme === 'light' ? '#000' : '#fff',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    borderRadius: '8px',
  };

  // Updated mobile menu button style (removed black border; added drop shadow)
  const mobileButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '20px',
    display: screens.xs ? 'block' : 'none',
    backgroundColor:
      theme === 'light'
        ? 'rgba(255,255,255,0.4)'
        : 'rgba(0,0,0,0.4)',
    color: theme === 'light' ? '#000' : '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    transition: 'color 0.3s ease',
    zIndex: 999,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    fontSize: '1.3rem',
  };

  const mobileMenuOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor:
      theme === 'light'
        ? 'rgba(255,255,255,0.8)'
        : 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: mobileMenuOpen ? 1 : 0,
    pointerEvents: mobileMenuOpen ? 'auto' : 'none',
    transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
  };

  const mobileMenuButtonStyle = {
    width: '200px',
    height: '50px',
    fontSize: '1rem',
    margin: '10px 0',
    borderRadius: '8px',
  };

  const mobileExitButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    color: theme === 'light' ? '#000' : '#fff',
    cursor: 'pointer',
  };

  const paragraphStyle = {
    marginBottom: '20px',
    lineHeight: '1.6',
  };

  const cautionStyle = {
    margin: '20px 0',
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
  };

  const listItemStyle = {
    margin: '8px 0',
  };

  const finishButtonStyle = {
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#eee',
    border: '1px solid #333',
    borderRadius: '4px',
    color: '#000',
  };

  const clearButtonStyle = {
    ...finishButtonStyle,
    backgroundColor: '#ddd',
    margin: 0,
  };

  const ageContainerStyle = {
    marginBottom: '20px',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      {/* Absolutely positioned emoji layer */}
      <div style={emojiLayerStyle}>
        {emojiArray.map(({ id, emoji, topPos, leftPos, dx, dy, size, duration }) => {
          const styleSpan = {
            position: 'absolute',
            top: `${topPos}%`,
            left: `${leftPos}%`,
            fontSize: `${size}rem`,
            animation: `float ${duration}s forwards`,
            animationTimingFunction: 'ease-in-out',
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
          };
          return (
            <span key={id} style={styleSpan} onAnimationEnd={() => removeEmoji(id)}>
              {emoji}
            </span>
          );
        })}
      </div>

      {/* Global CSS overrides */}
      <style>{`
        @keyframes float {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy));
            opacity: 0;
          }
        }
        @keyframes glow {
          0% {
            box-shadow: 0 0 3px 1px rgba(0, 0, 255, 0.5);
          }
          33% {
            box-shadow: 0 0 3px 1px rgba(255, 255, 0, 0.5);
          }
          66% {
            box-shadow: 0 0 3px 1px rgba(255, 0, 0, 0.5);
          }
          100% {
            box-shadow: 0 0 3px 1px rgba(0, 0, 255, 0.5);
          }
        }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
        }
        .App-header, .ant-layout-header {
          display: none !important;
        }
        body {
          padding-top: env(safe-area-inset-top, 0) !important;
        }
      `}</style>

      {/* Mobile Floating Menu Button */}
      <Button icon={<MenuOutlined />} style={mobileButtonStyle} onClick={openMobileMenu} />

      {/* Mobile Menu Overlay */}
      <div style={mobileMenuOverlayStyle}>
        <button onClick={closeMobileMenu} style={mobileExitButtonStyle}>
          <CloseOutlined />
        </button>
        <Button
          icon={<PlusOutlined />}
          style={{ ...mobileMenuButtonStyle }}
          onClick={() => { closeMobileMenu(); handleCreateTest(); }}
        >
          Create
        </Button>
        <Button
          icon={<BarChartOutlined />}
          style={{ ...mobileMenuButtonStyle }}
          onClick={() => { closeMobileMenu(); handleViewStats(); }}
        >
          Stats
        </Button>
        <Button
          icon={<ShareAltOutlined />}
          style={{ ...mobileMenuButtonStyle }}
          onClick={() => { closeMobileMenu(); handleShare(); }}
        >
          Share
        </Button>
        <Button
          icon={<BulbOutlined />}
          style={{ ...mobileMenuButtonStyle }}
          onClick={() => { closeMobileMenu(); toggleTheme(); }}
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </div>

      {/* Desktop Fixed Menu Bar */}
      <div style={dockOverlayStyle}>
        {/* <Button icon={<PlusOutlined />} style={dockButtonStyle} onClick={handleCreateTest}>
          Create
        </Button> */}
        <Button icon={<BarChartOutlined />} style={dockButtonStyle} onClick={handleViewStats}>
          Stats
        </Button>
        <Button icon={<ShareAltOutlined />} style={dockButtonStyle} onClick={handleShare}>
          Share
        </Button>
        <Button icon={<BulbOutlined />} style={dockButtonStyle} onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </div>

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
          <img
            src="/images/logo.png"
            alt="Queen’s Purity Test Logo"
            style={{ maxWidth: '120%', height: 'auto' }}
          />
        </div>

        <p style={paragraphStyle}>
          Welcome to the unofficial Queen’s Purity Test—a playful twist on the classic Rice Purity Test, tailored for Queen’s University students. This is not affiliated with Queen’s, but it’s a fun way to reflect on your campus experiences and traditions.
        </p>

        <p style={cautionStyle}>
          Caution: This is not a bucket list. Attempting to do everything on this list in a single semester may lead to exhaustion, or worse!
        </p>

        <p style={paragraphStyle}>
          Check every statement that applies to you. When you're done, click "Finish Test" to see how your score compares to others!
        </p>

        {/* Age Input */}
        <div style={ageContainerStyle}>
          <p style={{ marginBottom: '5px' }}>Your Age (Optional):</p>
          <Input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ width: '150px' }}
          />
        </div>

        {/* Questions */}
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {questions.map((question, index) => (
            <li key={index} style={listItemStyle}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={answers[index]}
                  onChange={() => handleToggle(index)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                {question}
              </label>
            </li>
          ))}
        </ul>

        {/* Button row placed after questions */}
        <div style={buttonRowStyle}>
          <button style={finishButtonStyle} onClick={handleSubmit}>
            Finish Test
          </button>
          <button style={clearButtonStyle} onClick={handleClearAll}>
            Clear All Boxes
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainTest;
