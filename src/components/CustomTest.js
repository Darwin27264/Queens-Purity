// src/components/CustomTest.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

function CustomTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      const docRef = doc(db, 'customTests', testId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        // Check expiration (handles both Firestore Timestamp and Date)
        const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : data.expiresAt;
        if (expiresAt < now) {
          alert("This test has expired.");
          navigate('/');
          return;
        }
        setTestData(data);
        setAnswers(Array(data.questions.length).fill(false));
      } else {
        alert("Test not found.");
        navigate('/');
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
    const score = answers.filter(a => a).length;
    await addDoc(collection(db, 'customTestResults'), {
      testId,
      score,
      timestamp: serverTimestamp(),
    });
    navigate(`/custom/${testId}/results`);
  };

  if (!testData) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{testData.title}</h1>
      <p>Please answer the following questions:</p>
      <ul>
        {testData.questions.map((q, index) => (
          <li key={index} style={{ margin: '10px 0' }}>
            <label>
              <input 
                type="checkbox" 
                checked={answers[index]} 
                onChange={() => handleToggle(index)} 
                style={{ marginRight: '10px' }}
              />
              {q}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Finish Test</button>
    </div>
  );
}

export default CustomTest;
