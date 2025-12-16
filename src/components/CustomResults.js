// src/components/CustomResults.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { Bar } from '@ant-design/charts';
import { Statistic, Spin } from 'antd';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function CustomResults() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userScore = searchParams.get('score');

  useEffect(() => {
    let unsubscribe;
    try {
      const q = query(
        collection(db, 'customTestResults'),
        where('testId', '==', testId),
        orderBy('timestamp', 'desc')
      );
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach(doc => {
            results.push(doc.data());
          });
          const aggregation = {};
          results.forEach(result => {
            const score = result.score;
            aggregation[score] = (aggregation[score] || 0) + 1;
          });
          const chartData = Object.keys(aggregation)
            .map(score => ({
              score: Number(score),
              count: aggregation[score],
            }))
            .sort((a, b) => a.score - b.score);
          setData(chartData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching results:', err);
          setError('Failed to load results');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up query:', err);
      setError('Failed to load results');
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [testId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{error}</p>
      </div>
    );
  }

  const config = {
    data,
    xField: 'score',
    yField: 'count',
    meta: {
      score: { alias: 'Score' },
      count: { alias: 'Number of Users' },
    },
    height: 400,
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Times New Roman, serif'
    }}>
      <h1>Test Results</h1>
      {userScore && (
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2rem',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Your Score</p>
          <Statistic
            value={userScore}
            valueStyle={{
              fontSize: '4rem',
              fontWeight: 'bold',
            }}
          />
        </div>
      )}
      <Bar {...config} />
    </div>
  );
}

export default CustomResults;
