import React, { useEffect, useState } from 'react';
import './FizzyLogo.css';

const letters = ['f', 'i', 'z', 'z', 'y'];

const FizzyLogo = ({ oneWord }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (oneWord) {
      const interval = setInterval(() => {
        setIndex(prev => (prev + 1) % letters.length);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      let current = 0;
      let timeout;

      const loop = () => {
        if (current < letters.length) {
          setIndex(current);
          current++;
          timeout = setTimeout(loop, 300); // time per letter
        } else {
          timeout = setTimeout(() => {
            current = 0;
            loop();
          }, 3000); // delay after full word shown
        }
      };

      loop();

      return () => clearTimeout(timeout);
    }
  }, [oneWord]);

  return (
    <div className="logo">
      <span className="dot"></span>
      <span className="brand">
        {oneWord
          ? letters[index]
          : letters.slice(0, index + 1).map((l, i) => <span key={i}>{l}</span>)
        }
      </span>
    </div>
  );
};

export default FizzyLogo;
