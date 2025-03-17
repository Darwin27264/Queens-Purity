import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button, Input, notification, Grid, Popconfirm } from 'antd';
import {
  BarChartOutlined,
  ShareAltOutlined,
  MenuOutlined,
  CloseOutlined,
  MailOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { ThemeContext } from '../ThemeContext';

const { useBreakpoint } = Grid;

// Queen's-themed questions
const questions = [
    "Completed wizard",
    "Failed wizard",
    "Stayed in stauffer for 24 hours during exam season",
    "Been to tumble tuesday",
    "HOCOFOCO",
    "Pulled a fire alarm",
    "Woken up in res during night due to fire alarm",
    "Gotten a professional headshot from mitchell / goodes",
    "Had a startup idea / tried to do business",
    "Been to a house party",
    "Been to all clubs",
    "Been to a networking event",
    "Gotten linkedin premium",
    "Sung the “oil thigh” after a sports game",
    "Worn tricolour face paint",
    "Played beer bong at a house party",
    "Gotten your order wrong at lazys or loco",
    "Went to class drunk",
    "Went to class high",
    "Went to class crossed",
    "Did an exam drunk",
    "Did an exam high",
    "Did an exam crossed",
    "Did an exam that was pretty much identical to ones in the exam bank",
    "Failed a course",
    "Failed a course twice",
    "Had beef with roommate",
    "Had sex in a residence building in first year",
    "Had sex in a residence building",
    "Got walked in on during the deed",
    "Walked in on someone during their deed",
    "Done the deed with someone in the room",
    "Stopped the music at a party because there were cops outside",
    "Jumped the pier",
    "Skinny dipped in the pier",
    "Pissed in the pier",
    "Walked on the pier when it was frozen",
    "Had friends from another university come over for a party",
    "Went to another university for parties (why?)",
    "Took a seemingly easy elective and did miserably in the course",
    "Took a gender study course for elective",
    "Dropped a gender study course",
    "Been to 5 or fewer lectures for a course",
    "Gotten 80+ in a course without going to lectures",
    "Had your name shouted at a party",
    "Been on the executive team in club(s)",
    "Ended up in the ER due to alcohol",
    "Ended up in the COR",
    "Gotten a line skip",
    "Have an owala bottle",
    "Are you a smooth criminal?",
    "Sneaked alcohol into res",
    "Swallowed a may fly",
    "Played spikeball in city park",
    "Own a faculty jacket",
    "Own a vegan faculty jacket",
    "Own a queen’s merch",
    "Stalked your crush on linkedin",
    "Been on a date with someone you met on hinge / tinder / whatever dating app",
    "Been in a relationship with a TA",
    "Been in a relationship with a prof",
    "Faculty Hook-up",
    "Done absolute jack in a group assignment",
    "Done everything in a group assignment",
    "Had someone 19+ to buy you drinks / cannabis",
    "Had a meal in all the dining halls",
    "Stole from dining halls",
    "Ended first year with leftover tams",
    "Wore leggings / skinny jeans + lace top combo at clubs",
    "Wore a cap + chains combo at clubs",
    "Asked someone for money (for shots) at a club",
    "Spent more time at a pre than at the actual club",
    "Worked out in the ARC",
    "Tammed a booster juice after an ARC sess",
    "Faked illness for academic consideration",
    "Shotgunned a beer",
    "Shotgunned 3+ beer a night",
    "Used mobileorder",
    "Got lost on campus",
    "Threw up in a library / school building",
    "Submitted something to queensconfessionss",
    "Done something stupid when drunk",
    "Relied on chatgpt too much and failed an in person test",
    "Shittalked the commies",
    "Shittalked the eng kids",
    "Gotten into a new relationship < 30 days from ending the previous one",
    "Hooked up with someone on a sports team",
    "Hooked up with a commie and was disappointed",
    "Hooked up with an eng kids and was freaked out",
    "Have only worn formal clothings for interviews and not events",
    "Cheated on your significant other",
    "Got cheated on",
    "Watched queen’s band perform",
    "Been to the farmer’s market",
    "Said you were from Toronto but really from GTA",
    "Had to spent $100+ on course material",
    "Have friends from SLC / RMC",
    "Dated someone not your race",
    "WARLOCK",
    "Wuck festern?"
  ]  

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

const floatingEmojis = [
  '🎉', '🔥', '🌈', '🤩', '🎈', '👑', '🍀', '✨', '🦄', '🍕', '🍻', '🎂', '🌟', '🤟', '💃', '🕺'
];

function MainTest() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Preserve original container background for document/body
  const containerBackground = theme === 'light' ? '#f0f2f5' : '#121212';
  useEffect(() => {
    document.documentElement.style.backgroundColor = containerBackground;
    document.body.style.backgroundColor = containerBackground;
  }, [containerBackground]);

  const [answers, setAnswers] = useState(Array(questions.length).fill(false));
  const [age, setAge] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emojiArray, setEmojiArray] = useState([]);
  const spawnIntervalRef = useRef(null);

  function spawnEmoji() {
    const id = Date.now() + Math.random();
    const emoji = floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)];
    const topPos = randomInRange(0, 80);
    const leftPos = randomInRange(0, 80);
    const dx = randomInRange(-100, 100);
    const dy = randomInRange(-100, 100);
    const size = randomInRange(1.5, 3);
    const duration = randomInRange(5, 10);
    const newEmoji = { id, emoji, topPos, leftPos, dx, dy, size, duration };
    setEmojiArray((prev) => [...prev, newEmoji]);
  }

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

  const handleToggle = (index) => {
    const newAnswers = [...answers];
    newAnswers[index] = !newAnswers[index];
    setAnswers(newAnswers);
  };

  const handleClearAll = () => {
    setAnswers(Array(questions.length).fill(false));
  };

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

  const openMobileMenu = () => setMobileMenuOpen(true);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);

  // New background image layer behind all content
  const backgroundImageLayerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url("/images/background.png") repeat',
    backgroundSize: '1500px',
    zIndex: 0,
    };
    
    // Semi-transparent overlay to fade the background image
    const backgroundOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    };

  const containerStyle = {
    background: containerBackground,
    minHeight: '100vh',
    width: '100%',
    padding: '0 15px',
    boxSizing: 'border-box',
    fontFamily: 'Times New Roman, serif',
    color: theme === 'light' ? '#000' : '#fff',
    transition: 'color 0.3s ease, background 0.3s ease',
    position: 'relative',
    marginTop: screens.xs ? -90 : -10,
    fontSize: '1.1rem',
  };

  const emojiLayerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 2,
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
    zIndex: 3,
  };

  const buttonRowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '20px',
  };

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
    border: '1px',
    color: theme === 'light' ? '#000' : '#fff',
    fontWeight: '100',
    fontSize: '1.1rem',
    fontFamily: 'Times New Roman, serif',
    borderColor: theme === 'light' ? '#000' : '#fff',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  // Define mobileMenuButtonStyle BEFORE using it
  const mobileMenuButtonStyle = {
    width: '200px',
    height: '50px',
    fontSize: '1.2rem',
    fontFamily: 'Times New Roman, serif',
    margin: '10px 0',
    borderRadius: '8px',
  };

  const darkModeButtonDesktop = (
    <Button
      icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
      style={dockButtonStyle}
      onClick={toggleTheme}
    />
  );

  const darkModeButtonMobile = (
    <Button
      icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
      style={{ ...mobileMenuButtonStyle }}
      onClick={() => { closeMobileMenu(); toggleTheme(); }}
    />
  );

  const mobileButtonStyle = {
    position: 'fixed',
    top: '15px',
    right: '35px',
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
    width: '45px',
    height: '45px',
    fontSize: '1.4rem',
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

  const mobileExitButtonStyle = {
    position: 'absolute',
    top: '25px',
    right: '35px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.6rem',
    color: theme === 'light' ? '#000' : '#fff',
    cursor: 'pointer',
  };

  const paragraphStyle = {
    marginBottom: '20px',
    lineHeight: '1.6',
    textAlign: 'center',
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
      {/* Background image layer */}
      <div style={backgroundImageLayerStyle} />
      <div style={backgroundOverlayStyle} />
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
        <Button icon={<BarChartOutlined />} style={{ ...mobileMenuButtonStyle }} onClick={() => { closeMobileMenu(); handleViewStats(); }}>
          Stats
        </Button>
        <Button icon={<ShareAltOutlined />} style={{ ...mobileMenuButtonStyle }} onClick={() => { closeMobileMenu(); handleShare(); }}>
          Share
        </Button>
        <Button icon={<MailOutlined />} style={{ ...mobileMenuButtonStyle }} onClick={() => { closeMobileMenu(); navigate('/feedback'); }}>
          Feedback
        </Button>
        {darkModeButtonMobile}
      </div>

      {/* Desktop Fixed Menu Bar */}
      <div style={dockOverlayStyle}>
        <Button icon={<BarChartOutlined />} style={dockButtonStyle} onClick={handleViewStats}>
          Stats
        </Button>
        <Button icon={<ShareAltOutlined />} style={dockButtonStyle} onClick={handleShare}>
          Share
        </Button>
        <Button icon={<MailOutlined />} style={dockButtonStyle} onClick={() => navigate('/feedback')}>
          Feedback
        </Button>
        {darkModeButtonDesktop}
      </div>

      {/* Main Content */}
      <div style={contentStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
          <img
            src="/images/logo.png"
            alt="Queen’s Purity Test Logo"
            style={{ maxWidth: '130%', height: 'auto' }}
          />
        </div>

        <p style={paragraphStyle}>
            The Queen's Purity Test has historically served as a way for students to bond and track their experiences throughout their time at the Queen's University. It's a voluntary opportunity for students to reflect on their unique university journey.
        </p>

        <p style={cautionStyle}>
            Caution: This is not a bucket list. Completion of all items will not result in anything good.
        </p>

        <p style={paragraphStyle}>
            Click on every item you have done. Your purity score will be calculated at the end.
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
                {index + 1}. <input
                  type="checkbox"
                  checked={answers[index]}
                  onChange={() => handleToggle(index)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                /> {question}
              </label>
            </li>
          ))}
        </ul>

        {/* Button row placed after questions */}
        <div style={buttonRowStyle}>
          <button style={finishButtonStyle} onClick={handleSubmit}>
            Finish Test
          </button>
          <Popconfirm
            title="Are you sure you want to clear all boxes?"
            onConfirm={handleClearAll}
            okText="Yes"
            cancelText="No"
          >
            <button style={clearButtonStyle}>
              Clear All Boxes
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

export default MainTest;
