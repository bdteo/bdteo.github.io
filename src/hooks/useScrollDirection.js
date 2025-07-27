// src/hooks/useScrollDirection.js

import { useState, useEffect } from 'react';

const useScrollDirection = (threshold = 10) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      const atTop = scrollY < threshold;

      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > threshold || scrollY - lastScrollY < -threshold)
      ) {
        setScrollDirection(direction);
      }

      setIsAtTop(atTop);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const handleScroll = () => requestTick();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDirection, threshold]);

  return { scrollDirection, isAtTop };
};

export default useScrollDirection;