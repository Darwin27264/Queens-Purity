import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // Immediate scroll
    scrollToTop();
    
    // Also scroll after render completes
    const timeoutId = setTimeout(scrollToTop, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;

