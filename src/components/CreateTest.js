// src/components/CreateTest.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { notification } from 'antd';
import { validateTitle, validateQuestion } from '../utils/validation';
import { checkRateLimit, recordAttempt, getRateLimitMessage } from '../utils/rateLimiter';

function CreateTest() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [errors, setErrors] = useState({ title: null, questions: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
    
    // Clear error for this question when user types
    if (errors.questions[index]) {
      const newErrors = { ...errors };
      delete newErrors.questions[index];
      setErrors(newErrors);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Check rate limit
    const rateLimitCheck = checkRateLimit('customTestCreation');
    if (!rateLimitCheck.isAllowed) {
      notification.error({
        message: 'Rate Limit Exceeded',
        description: getRateLimitMessage(rateLimitCheck),
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({ title: null, questions: {} });

    // Validate title
    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
      setErrors({ title: titleValidation.error, questions: {} });
      setIsSubmitting(false);
      notification.error({
        message: 'Validation Error',
        description: titleValidation.error,
      });
      return;
    }

    // Validate all questions
    const filteredQuestions = questions.filter(q => q.trim() !== '');
    if (filteredQuestions.length === 0) {
      setErrors({ title: null, questions: { general: 'At least one question is required' } });
      setIsSubmitting(false);
      notification.error({
        message: 'Validation Error',
        description: 'At least one question is required',
      });
      return;
    }

    const questionErrors = {};
    const validatedQuestions = [];
    let hasErrors = false;

    filteredQuestions.forEach((q, index) => {
      const questionValidation = validateQuestion(q);
      if (!questionValidation.isValid) {
        questionErrors[index] = questionValidation.error;
        hasErrors = true;
      } else {
        validatedQuestions.push(questionValidation.sanitized);
      }
    });

    if (hasErrors) {
      setErrors({ title: null, questions: questionErrors });
      setIsSubmitting(false);
      notification.error({
        message: 'Validation Error',
        description: 'Please fix the errors in your questions',
      });
      return;
    }

    try {
      // Set expiry to 1 day from now
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      const testData = {
        title: titleValidation.sanitized,
        questions: validatedQuestions,
        createdAt: serverTimestamp(),
        expiresAt: expiry,
      };
      
      const docRef = await addDoc(collection(db, 'customTests'), testData);
      recordAttempt('customTestCreation');
      navigate(`/custom/${docRef.id}`);
    } catch (error) {
      console.error('Error creating test:', error);
      setIsSubmitting(false);
      notification.error({
        message: 'Error',
        description: 'Unable to create test. Please check your connection and try again.',
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Your Own Test</h1>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Test Title: </label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors({ ...errors, title: null });
            }
          }}
          maxLength={200}
          style={{ 
            width: '300px',
            borderColor: errors.title ? 'red' : undefined
          }}
        />
        {errors.title && (
          <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
            {errors.title}
          </div>
        )}
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
          {title.length}/200 characters
        </div>
      </div>
      <h3>Questions:</h3>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <input 
            type="text"
            placeholder={`Question ${index + 1}`}
            value={q}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            maxLength={500}
            style={{ 
              width: '400px',
              borderColor: errors.questions[index] ? 'red' : undefined
            }}
          />
          {errors.questions[index] && (
            <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
              {errors.questions[index]}
            </div>
          )}
          <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            {q.length}/500 characters
          </div>
        </div>
      ))}
      {errors.questions.general && (
        <div style={{ color: 'red', fontSize: '0.9em', marginBottom: '10px' }}>
          {errors.questions.general}
        </div>
      )}
      <button onClick={addQuestion}>Add Question</button>
      <br /><br />
      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          opacity: isSubmitting ? 0.6 : 1
        }}
      >
        {isSubmitting ? 'Creating...' : 'Generate Test'}
      </button>
    </div>
  );
}

export default CreateTest;
