import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { MailOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { collection, addDoc } from 'firebase/firestore';
import { db, serverTimestamp } from '../firebase';

function Feedback() {
  const navigate = useNavigate();
  const { theme } = React.useContext(ThemeContext);
  const [form] = Form.useForm();
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async () => {
    const values = form.getFieldsValue();
    if (!values.feedback || values.feedback.trim() === "") {
      alert("Please enter your feedback.");
      return;
    }
    try {
      await addDoc(collection(db, 'feedback'), {
        feedback: values.feedback,
        timestamp: serverTimestamp(),
      });
      setShowPopup(true);
      setTimeout(() => {
        form.resetFields();
      }, 500);
    } catch (error) {
      console.error(error);
      alert("There was an error submitting your feedback. Please try again later.");
    }
  };

  // Floating back button style (top left of screen)
  const floatingBackButtonStyle = {
    position: 'fixed',
    top: '20px',
    left: '15px',
    backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
    color: theme === 'light' ? '#000' : '#fff',
    fontWeight: '100',
    fontSize: '1.1rem',
    fontFamily: 'Times New Roman, serif',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    borderRadius: '8px',
    zIndex: 1000,
    border: 'none',
  };

  // Shared button style for form buttons
  const buttonStyle = {
    backgroundColor: 'transparent',
    border: `1px solid ${theme === 'light' ? '#000' : '#fff'}`,
    color: theme === 'light' ? '#000' : '#fff',
    fontWeight: '100',
    fontSize: '1.1rem',
    fontFamily: 'Times New Roman, serif',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    borderRadius: '8px',
  };

  // Popup overlay style
  const popupOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  };

  const popupContentStyle = {
    backgroundColor: theme === 'light' ? '#fff' : '#333',
    color: theme === 'light' ? '#000' : '#fff',
    padding: '20px',
    borderRadius: '8px',
    fontFamily: 'Times New Roman, serif',
    textAlign: 'center',
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '40px auto',
      fontFamily: 'Times New Roman, serif',
      color: theme === 'light' ? '#000' : '#fff',
      backgroundColor: theme === 'light' ? '#fff' : '#333',
      borderRadius: '8px',
    }}>
      {/* Floating Back Button at top left */}
      <Button 
        icon={<LeftOutlined />} 
        onClick={() => navigate(-1)} 
        style={floatingBackButtonStyle}
      />
      <h1 style={{ fontFamily: 'Times New Roman, serif' }}>📝 Feedback</h1>
      <p style={{ fontFamily: 'Times New Roman, serif' }}>
        If you have any improvement ideas or feedback, please let us know by submitting your feedback below.
      </p>
      <Form form={form} layout="vertical" style={{ fontFamily: 'Times New Roman, serif' }}>
        <Form.Item
          name="feedback"
          rules={[{ required: true, message: 'Please enter your feedback' }]}
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          <Input.TextArea rows={6} placeholder="Feedback here..." />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            icon={<MailOutlined />} 
            onClick={handleSubmit}
            style={buttonStyle}
          >
            Send
          </Button>
        </Form.Item>
      </Form>
      {showPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupContentStyle}>
            <h2>Received!</h2>
            <p>Thanks for your feedback!😎</p>
            <Button onClick={() => setShowPopup(false)} style={buttonStyle}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Feedback;
