// src/components/CustomResults.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { Bar } from '@ant-design/charts';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function CustomResults() {
  const { testId } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'customTestResults'),
      where('testId', '==', testId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach(doc => {
        results.push(doc.data());
      });
      const aggregation = {};
      results.forEach(result => {
        const score = result.score;
        aggregation[score] = (aggregation[score] || 0) + 1;
      });
      const chartData = Object.keys(aggregation).map(score => ({
        score,
        count: aggregation[score],
      }));
      setData(chartData);
    });
    return () => unsubscribe();
  }, [testId]);

  const config = {
    data,
    xField: 'score',
    yField: 'count',
    meta: {
      score: { alias: 'Score' },
      count: { alias: 'Number of Users' },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Results</h1>
      <Bar {...config} />
    </div>
  );
}

export default CustomResults;
