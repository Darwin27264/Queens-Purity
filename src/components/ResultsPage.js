// src/components/ResultsPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import { Statistic, Typography, Button, notification } from 'antd';
import { LeftOutlined, ShareAltOutlined } from '@ant-design/icons';
import { ThemeContext } from '../ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

// --- RECHARTS IMPORTS ---
import {
  BarChart as ReBarChart,
  Bar as ReBar,
  PieChart as RePieChart,
  Pie as RePie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const { Title, Text } = Typography;

// Helper functions
const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const median = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

function ResultsPage() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);

  // Detect if on mobile (below 768px)
  const isMobile = useIsMobile(768);

  // Define theme styles including matte transparent button backgrounds
  const themeStyles = {
    light: {
      containerBg: '#f0f2f5',
      cardBg: '#fff',
      textColor: '#000',
      accentColor: '#1890ff',
      buttonBg: 'rgba(255, 255, 255, 0.8)',
    },
    dark: {
      containerBg: '#121212',
      cardBg: '#1E1E1E',
      textColor: '#E0E0E0',
      accentColor: '#FFC107',
      buttonBg: 'rgba(0, 0, 0, 0.8)',
    },
  };
  const { containerBg, cardBg, textColor, accentColor, buttonBg } = themeStyles[theme];

  // Fetch Firestore data
  useEffect(() => {
    const q = query(collection(db, 'mainTestResults'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach((doc) => results.push(doc.data()));
      setData(results);
    });
    return () => unsubscribe();
  }, []);

  // Compute statistics
  let stats = null;
  let additionalStats = {};
  if (data.length > 0) {
    const scores = data.map((d) => d.score);
    const validAges = data
      .map((d) => d.age)
      .filter((age) => age !== null && age !== undefined);

    const avgScore = average(scores);
    const medScore = median(scores);
    const avgAge = validAges.length ? average(validAges) : null;
    const medAge = validAges.length ? median(validAges) : null;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const modeScore = Object.keys(
      scores.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {})
    ).reduce((a, b) =>
      scores.filter((x) => x === Number(a)).length >
      scores.filter((x) => x === Number(b)).length
        ? a
        : b
    );

    const ageRange = validAges.length
      ? `${Math.min(...validAges)} - ${Math.max(...validAges)}`
      : 'N/A';

    stats = {
      total: data.length,
      avgScore: avgScore.toFixed(2),
      medianScore: medScore,
      avgAge: avgAge ? avgAge.toFixed(2) : 'N/A',
      medianAge: medAge || 'N/A',
    };

    additionalStats = {
      modeScore,
      highestScore,
      lowestScore,
      ageRange,
    };
  }

  // Prepare chart data for Recharts
  const scoreCounts = {};
  data.forEach((d) => {
    scoreCounts[d.score] = (scoreCounts[d.score] || 0) + 1;
  });
  const scoreDistData = Object.keys(scoreCounts).map((score) => ({
    score: Number(score),
    count: scoreCounts[score],
  }));

  // --- LAYOUT STYLES ---

  // On desktop, use a slightly larger size for each column.
  const blockSize = isMobile ? '200px' : '180px';

  // Outer container with extra top & bottom spacing
  const containerStyle = {
    backgroundColor: containerBg,
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    color: textColor,
    transition: 'background-color 0.3s ease, color 0.3s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '2rem 0.5rem',
    boxSizing: 'border-box',
    fontFamily: 'Georgia, serif',
  };

  // Main content area
  const contentStyle = {
    width: '100%',
    maxWidth: isMobile ? '400px' : '800px',
    position: 'relative',
    padding: '0 1rem',
    fontFamily: 'Georgia, serif',
  };

  // 2 columns on mobile, 4 on desktop. Each column is `blockSize` wide.
  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, ${blockSize})`,
    justifyContent: 'center',
    gap: '0.55rem',
    fontFamily: 'Georgia, serif',
  };

  // We remove `width: blockSize` so the item width is controlled by the grid.
  // We keep `height: blockSize` so each block is the same height.
  const squareBlockStyle = {
    backgroundColor: cardBg,
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: blockSize,
    padding: '0.5rem',
  };

  // Bar chart block should span 2 columns. No forced width so it will be
  // exactly double the width of a normal block (2 columns).
  const barBlockStyle = {
    ...squareBlockStyle,
    gridColumn: 'span 2',
  };

  // For charts, fill the entire block minus a little space for the title.
  const chartContainerStyle = {
    width: '100%',
    height: `calc(${blockSize} - 1.2rem)`,
  };

  // Titles & text
  const blockTitleStyle = {
    marginBottom: '4px',
    color: textColor,
    fontSize: '1rem',
    fontFamily: 'Georgia, serif',
  };
  const headerTitleStyle = {
    margin: 10,
    color: textColor,
    fontSize: '1.4rem',
    fontFamily: 'Georgia, serif',
  };
  const headerTextStyle = {
    color: textColor,
    fontSize: '1rem',
    fontFamily: 'Georgia, serif',
  };

  function StatBlock({ title, value }) {
    return (
      <div style={squareBlockStyle}>
        <Title level={5} style={blockTitleStyle}>
          {title}
        </Title>
        <Statistic
          value={value}
          valueStyle={{
            color: accentColor,
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        />
      </div>
    );
  }

  // Optionally scale content on mobile
  const scaleStyle = isMobile
    ? {
        transform: 'scale(0.95)',
        transformOrigin: 'top center',
      }
    : {};

  // Matte transparent style for floating buttons
  const floatingButtonStyle = {
    position: 'fixed',
    zIndex: 1000,
    fontSize: '1.2rem',
    backgroundColor: buttonBg,
    border: 'none',
    color: textColor,
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    backdropFilter: 'blur(4px)',
  };

  // Share functionality
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

  return (
    <div style={containerStyle}>
      {/* Floating buttons */}
      <Button
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)}
        style={{
          ...floatingButtonStyle,
          top: 20,
          left: 15,
        }}
      />
      <Button
        icon={<ShareAltOutlined />}
        onClick={handleShare}
        style={{
          ...floatingButtonStyle,
          top: 20,
          right: 15,
        }}
      />

      {/* Main content (with scaling if needed) */}
      <div style={{ ...contentStyle, ...scaleStyle }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Title level={3} style={headerTitleStyle}>
            Queen’s Purity Test Results
          </Title>
          <Text style={headerTextStyle}>
            A snapshot of how Queen’s students are faring on the Purity Test.
          </Text>
        </div>

        <div style={gridContainerStyle}>
          {/* 1: Total Submissions */}
          <StatBlock
            title="📊 Total Submissions"
            value={stats ? stats.total : 0}
          />
          {/* 2: Avg Score */}
          <StatBlock
            title="⭐ Avg Score"
            value={stats ? stats.avgScore : 0}
          />
          {/* 3: Bar Chart (spans 2 columns) */}
          <div style={barBlockStyle}>
            <Title level={5} style={blockTitleStyle}>
              📈 Score Distribution
            </Title>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={scoreDistData}>
                  <XAxis dataKey="score" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{ backgroundColor: cardBg }}
                    labelStyle={{ color: textColor }}
                    itemStyle={{ color: textColor }}
                  />
                  <ReBar dataKey="count" fill={accentColor} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 4: Median Score */}
          <StatBlock
            title="⚖️ Median Score"
            value={stats ? stats.medianScore : 0}
          />
          {/* 5: Pie Chart */}
          <div style={squareBlockStyle}>
            <Title level={5} style={blockTitleStyle}>
              🍰 Score in a Pie
            </Title>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: cardBg }}
                    labelStyle={{ color: textColor }}
                    itemStyle={{ color: textColor }}
                  />
                  <RePie
                    data={scoreDistData}
                    dataKey="count"
                    nameKey="score"
                    outerRadius="80%"
                    fill={accentColor}
                    label
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 6: Highest Score */}
          <StatBlock
            title="🏆 Highest Score"
            value={additionalStats.highestScore || 0}
          />
          {/* 7: Lowest Score */}
          <StatBlock
            title="😢 Lowest Score"
            value={additionalStats.lowestScore || 0}
          />
          {/* 8: Mode Score */}
          <StatBlock
            title="🔥 Mode Score"
            value={additionalStats.modeScore || 0}
          />
          {/* 9: Age Range */}
          <StatBlock
            title="📊 Age Range"
            value={additionalStats.ageRange || 'N/A'}
          />
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
