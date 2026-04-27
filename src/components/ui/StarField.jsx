import React, { useEffect, useRef } from 'react';
import './StarField.css';

const StarField = () => {
  const fieldRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const starField = fieldRef.current;
    if (!starField) return;

    const noOfStars = 100;
    const speed = 1;
    let starFieldWidth = window.innerWidth;
    let starFieldHeight = window.innerHeight;

    const getStarColor = (index) => {
      if (index % 8 === 0) return 'red';
      if (index % 10 === 0) return 'yellow';
      if (index % 17 === 0) return 'blue';
      return 'white';
    };

    const getStarDistance = (index) => {
      if (index % 6 === 0) return '';
      if (index % 9 === 0) return 'near';
      if (index % 2 === 0) return 'far';
      return '';
    };

    const getStarRelativeSpeed = (index) => {
      if (index % 6 === 0) return 0.5;
      if (index % 9 === 0) return 1;
      if (index % 2 === 0) return -0.5;
      return 0;
    };

    // Initialize stars
    const stars = [];
    starField.innerHTML = ''; // Clear existing
    for (let i = 0; i < noOfStars; i++) {
      const star = document.createElement('div');
      const distanceClass = getStarDistance(i);
      const colorClass = getStarColor(i);
      star.className = `star ${colorClass} ${distanceClass}`;
      
      const topOffset = Math.floor(Math.random() * starFieldHeight);
      const leftOffset = Math.floor(Math.random() * starFieldWidth);
      
      star.style.top = `${topOffset}px`;
      star.style.left = `${leftOffset}px`;
      
      starField.appendChild(star);
      stars.push({
        el: star,
        relativeSpeed: getStarRelativeSpeed(i),
        left: leftOffset
      });
    }
    starsRef.current = stars;

    const animate = () => {
      const currentWidth = window.innerWidth;
      starsRef.current.forEach((starObj) => {
        const leftChangeAmount = speed + starObj.relativeSpeed;
        starObj.left -= leftChangeAmount;
        
        if (starObj.left < -10) {
          starObj.left = currentWidth + 10;
        } else if (starObj.left > currentWidth + 10) {
          starObj.left = -10;
        }
        
        starObj.el.style.left = `${starObj.left}px`;
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      starFieldWidth = window.innerWidth;
      starFieldHeight = window.innerHeight;
      // Optionally reposition stars on resize, but let's keep it simple
    };

    window.addEventListener('resize', handleResize);
    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <div id="star-field" ref={fieldRef} />;
};

export default StarField;
