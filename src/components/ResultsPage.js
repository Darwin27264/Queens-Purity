import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import { Statistic, Typography, Button, notification, Tooltip } from 'antd';
import { LeftOutlined, ShareAltOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
  Tooltip as ReTooltip,
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line as ReLine,
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Detect if on mobile (below 768px)
  const isMobile = useIsMobile(768);

  // Define theme styles including matte transparent button backgrounds
  const themeStyles = {
    light: {
      containerBg: '#f0f2f5',
      cardBg: '#fff',
      textColor: '#000',
      accentColor: '#18325c',
      buttonBg: 'rgba(255, 255, 255, 0.8)',
    },
    dark: {
      containerBg: '#121212',
      cardBg: '#1E1E1E',
      textColor: '#E0E0E0',
      accentColor: '#eabe3c',
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
  let completionRate = 0,
    partyAnimalRate = 0,
    academicRebellionRatio = 0,
    campusRomanceRate = 0,
    socialButterflyScore = 0,
    wildMisadventureAvg = 0;
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

    const total = data.length;
    completionRate = (data.filter((d) => d.completedWizard).length / total) * 100;
    partyAnimalRate = (data.filter((d) => d.partyAnimal).length / total) * 100;
    academicRebellionRatio = (data.filter((d) => d.academicRebel).length / total) * 100;
    campusRomanceRate = (data.filter((d) => d.campusRomance).length / total) * 100;
    socialButterflyScore = data.reduce((sum, d) => sum + (d.socialEventsCount || 0), 0) / total;
    wildMisadventureAvg = data.reduce((sum, d) => sum + (d.wildMisadventureCount || 0), 0) / total;
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

  // New chart data for aggregated rates and social/wild averages
  const aggregatedRatesData = [
    { name: 'Completion', rate: Number(completionRate.toFixed(2)) },
    { name: 'Party Animal', rate: Number(partyAnimalRate.toFixed(2)) },
    { name: 'Academic Rebel', rate: Number(academicRebellionRatio.toFixed(2)) },
    { name: 'Campus Romance', rate: Number(campusRomanceRate.toFixed(2)) },
  ];

  const socialWildData = [
    { name: 'Social Butterfly', avg: Number(socialButterflyScore.toFixed(2)) },
    { name: 'Wild Misadventure', avg: Number(wildMisadventureAvg.toFixed(2)) },
  ];

  // --- LAYOUT STYLES ---
  const blockSize = isMobile ? '200px' : '180px';

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
    fontFamily: 'Times New Roman, serif',
  };

  const contentStyle = {
    width: '100%',
    maxWidth: isMobile ? '400px' : '800px',
    position: 'relative',
    padding: '0 1rem',
    fontFamily: 'Times New Roman, serif',
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, ${blockSize})`,
    justifyContent: 'center',
    gap: '0.55rem',
    fontFamily: 'Times New Roman, serif',
  };

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

  const barBlockStyle = {
    ...squareBlockStyle,
    gridColumn: 'span 2',
  };

  const chartContainerStyle = {
    width: '100%',
    height: `calc(${blockSize} - 1.2rem)`,
  };

  const blockTitleStyle = {
    marginBottom: '4px',
    color: textColor,
    fontSize: '1rem',
    fontFamily: 'Times New Roman, serif',
  };
  const headerTitleStyle = {
    margin: 10,
    color: textColor,
    fontSize: '1.4rem',
    fontFamily: 'Times New Roman, serif',
  };
  const headerTextStyle = {
    color: textColor,
    fontSize: '1rem',
    fontFamily: 'Times New Roman, serif',
  };

  // Updated StatBlock with a tooltip question icon
  function StatBlock({ title, value, info }) {
    return (
      <div style={squareBlockStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={5} style={blockTitleStyle}>
            {title}
          </Title>
          {info && (
            <Tooltip title={info}>
              <InfoCircleOutlined style={{ marginLeft: '0.5rem', cursor: 'pointer', color: accentColor }} />
            </Tooltip>
          )}
        </div>
        <Statistic
          value={value}
          valueStyle={{
            color: accentColor,
            fontSize: '2rem',
            fontWeight: '400',
          }}
        />
      </div>
    );
  }

  const scaleStyle = isMobile
    ? {
        transform: 'scale(0.95)',
        transformOrigin: 'top center',
      }
    : {};

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
          {/* Existing Stat Blocks with detailed info tooltips */}
          <StatBlock 
            title="📊 Total Submissions" 
            value={stats ? stats.total : 0} 
            info="Total count of responses submitted." 
          />
          <StatBlock 
            title="⭐ Avg Score" 
            value={stats ? stats.avgScore : 0} 
            info="Average score calculated as the sum of all scores divided by the number of responses." 
          />
          <div style={barBlockStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Title level={5} style={blockTitleStyle}>
                📈 Score Distribution
              </Title>
              <Tooltip title="Number of responses that achieved each score.">
                <InfoCircleOutlined style={{ marginLeft: '0.5rem', cursor: 'pointer', color: accentColor }} />
              </Tooltip>
            </div>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={scoreDistData}>
                  <XAxis dataKey="score" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: cardBg }}
                    labelStyle={{ color: textColor }}
                    itemStyle={{ color: textColor }}
                  />
                  <ReBar dataKey="count" fill={accentColor} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <StatBlock 
            title="⚖️ Median Score" 
            value={stats ? stats.medianScore : 0} 
            info="Middle value of the sorted scores list." 
          />
          <div style={squareBlockStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Title level={5} style={blockTitleStyle}>
                🍰 Score in a Pie
              </Title>
              <Tooltip title="Pie chart showing the percentage breakdown of scores.">
                <InfoCircleOutlined style={{ marginLeft: '0.5rem', cursor: 'pointer', color: accentColor }} />
              </Tooltip>
            </div>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <ReTooltip
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
          <StatBlock 
            title="🏆 Highest Score" 
            value={additionalStats.highestScore || 0} 
            info="Maximum score achieved among all responses." 
          />
          <StatBlock 
            title="😢 Lowest Score" 
            value={additionalStats.lowestScore || 0} 
            info="Minimum score achieved among all responses." 
          />
          <StatBlock 
            title="🔥 Mode Score" 
            value={additionalStats.modeScore || 0} 
            info="Most frequently occurring score." 
          />
          <StatBlock 
            title="📊 Age Range" 
            value={additionalStats.ageRange || 'N/A'} 
            info="Difference between the youngest and oldest respondent ages." 
          />

          {/* New Stat Blocks for extra metrics with detailed calculation info */}
          <StatBlock 
            title="📈 Completion Rate" 
            value={data.length ? `${completionRate.toFixed(2)}%` : '0%'} 
            info="Calculated as the percentage of responses where 'Completed wizard' was checked." 
          />
          <StatBlock 
            title="🎉 Party Animal" 
            value={data.length ? `${partyAnimalRate.toFixed(2)}%` : '0%'} 
            info="Percentage of responses with wild party behaviors (e.g., playing beer bong, shotgunning a beer)." 
          />
          <StatBlock 
            title="🚀 Academic Rebel" 
            value={data.length ? `${academicRebellionRatio.toFixed(2)}%` : '0%'} 
            info="Percentage of responses indicating academic risk-taking (e.g., doing an exam while impaired or faking illness)." 
          />
          <StatBlock 
            title="💘 Campus Romance" 
            value={data.length ? `${campusRomanceRate.toFixed(2)}%` : '0%'} 
            info="Percentage of responses with on-campus romantic encounters (e.g., sex in a residence or getting walked in on)." 
          />
          <StatBlock 
            title="🦋 Social Butterfly" 
            value={data.length ? socialButterflyScore.toFixed(2) : '0'} 
            info="Average number of social events per respondent (includes networking events, club leadership, and LinkedIn stalking)." 
          />
          <StatBlock 
            title="😜 Wild Misadventure" 
            value={data.length ? wildMisadventureAvg.toFixed(2) : '0'} 
            info="Average count of extreme actions per respondent (e.g., pulling a fire alarm, jumping the pier, throwing up in a library)." 
          />

          {/* New Chart Block: Aggregated Rates using a Bar Chart */}
          <div style={barBlockStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Title level={5} style={blockTitleStyle}>
                📊 Aggregated Rates
              </Title>
              <Tooltip title="Bar chart showing the aggregated percentages for completion, party, academic, and romance metrics.">
                <InfoCircleOutlined style={{ marginLeft: '0.5rem', cursor: 'pointer', color: accentColor }} />
              </Tooltip>
            </div>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={aggregatedRatesData}>
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: cardBg }}
                    labelStyle={{ color: textColor }}
                    itemStyle={{ color: textColor }}
                  />
                  <ReBar dataKey="rate" fill={accentColor} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New Chart Block: Social & Wild Averages using a Line Chart */}
          <div style={barBlockStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Title level={5} style={blockTitleStyle}>
                📈 Social & Wild Averages
              </Title>
              <Tooltip title="Line chart of the average number of social events and extreme actions reported per respondent.">
                <InfoCircleOutlined style={{ marginLeft: '0.5rem', cursor: 'pointer', color: accentColor }} />
              </Tooltip>
            </div>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={socialWildData}>
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <ReTooltip
                    contentStyle={{ backgroundColor: cardBg }}
                    labelStyle={{ color: textColor }}
                    itemStyle={{ color: textColor }}
                  />
                  <ReLine type="monotone" dataKey="avg" stroke={accentColor} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
