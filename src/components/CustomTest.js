// src/components/CustomTest.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { notification, Spin } from 'antd';
import { validateTestId } from '../utils/validation';
import { checkRateLimit, recordAttempt, getRateLimitMessage } from '../utils/rateLimiter';

function CustomTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Validate testId first
    const testIdValidation = validateTestId(testId);
    if (!testIdValidation.isValid) {
      setError('Invalid test ID');
      setLoading(false);
      notification.error({
        message: 'Invalid Test',
        description: 'The test ID is invalid.',
      });
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const fetchTest = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'customTests', testId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const now = new Date();
          // Check expiration (handles both Firestore Timestamp and Date)
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt;
          if (expiresAt && expiresAt < now) {
            notification.warning({
              message: 'Test Expired',
              description: 'This test has expired.',
            });
            navigate('/');
            return;
          }
          setTestData(data);
          setAnswers(Array(data.questions.length).fill(false));
        } else {
          notification.error({
            message: 'Test Not Found',
            description: 'The test you are looking for does not exist.',
          });
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError('Failed to load test. Please try again.');
        notification.error({
          message: 'Error',
          description: 'Unable to load the test. Please check your connection and try again.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  const handleToggle = (index) => {
    const newAnswers = [...answers];
    newAnswers[index] = !newAnswers[index];
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Check rate limit
    const rateLimitCheck = checkRateLimit('testSubmission');
    if (!rateLimitCheck.isAllowed) {
      notification.error({
        message: 'Rate Limit Exceeded',
        description: getRateLimitMessage(rateLimitCheck),
      });
      return;
    }
    
    setSubmitting(true);
    const score = answers.filter(a => a).length;
    
    try {
      // Navigate immediately
      navigate(`/custom/${testId}/results?score=${score}`);
      
      // Save in background
      const firebasePromise = addDoc(collection(db, 'customTestResults'), {
        testId,
        score,
        timestamp: serverTimestamp(),
      });
      
      recordAttempt('testSubmission');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      await Promise.race([firebasePromise, timeoutPromise]);
    } catch (err) {
      console.error('Error saving result:', err);
      // Already navigated, so just log the error
      // Error is non-blocking, user can still see results
    }
  };

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

  if (error || !testData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{error || 'Test not found'}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Times New Roman, serif'
    }}>
      <h1>{testData.title}</h1>
      <p>Please answer the following questions:</p>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {testData.questions.map((q, index) => (
          <li key={index} style={{ margin: '14px 0' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start' }}>
              <input 
                type="checkbox" 
                checked={answers[index]} 
                onChange={() => handleToggle(index)} 
                style={{ marginRight: '10px', marginTop: '4px', cursor: 'pointer' }}
              />
              <span>{index + 1}. {q}</span>
            </label>
          </li>
        ))}
      </ul>
      <button 
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          padding: '10px 20px',
          fontSize: '1rem',
          cursor: submitting ? 'not-allowed' : 'pointer',
          backgroundColor: '#eee',
          border: '1px solid #333',
          borderRadius: '4px',
        }}
      >
        {submitting ? 'Submitting...' : 'Finish Test'}
      </button>
    </div>
  );
}

export default CustomTest;
