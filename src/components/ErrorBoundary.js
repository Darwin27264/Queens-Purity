import React from 'react';
import { Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'Times New Roman, serif',
          textAlign: 'center',
          backgroundColor: '#f0f2f5',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Something went wrong</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              size="large"
            >
              Refresh Page
            </Button>
            <Button
              icon={<HomeOutlined />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              size="large"
            >
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

