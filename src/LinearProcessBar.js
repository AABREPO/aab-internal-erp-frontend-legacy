// App.js
import React, { useState, useEffect } from 'react';

function LinearProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 0 : prevProgress + 10
      );
    }, 500);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2>Basic Linear Progress Bar</h2>
      <div style={styles.container}>
        <div style={{ ...styles.bar, width: `${progress}%` }} />
      </div>
      <p>{progress}%</p>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '2rem',
    fontFamily: 'Arial',
  },
  container: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    height: '20px',
    marginTop: '10px',
  },
  bar: {
    height: '100%',
    backgroundColor: '#3f51b5',
    transition: 'width 0.3s ease-in-out',
  },
};

export default LinearProgressBar;
