// src/components/CreateTest.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleSubmit = async () => {
    // Set expiry to 1 day from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    const testData = {
      title,
      questions: questions.filter(q => q.trim() !== ''),
      createdAt: serverTimestamp(),
      expiresAt: expiry,
    };
    const docRef = await addDoc(collection(db, 'customTests'), testData);
    navigate(`/custom/${docRef.id}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Your Own Test</h1>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Test Title: </label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
      </div>
      <h3>Questions:</h3>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>
          <input 
            type="text"
            placeholder={`Question ${index + 1}`}
            value={q}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
        </div>
      ))}
      <button onClick={addQuestion}>Add Question</button>
      <br /><br />
      <button onClick={handleSubmit}>Generate Test</button>
    </div>
  );
}

export default CreateTest;
