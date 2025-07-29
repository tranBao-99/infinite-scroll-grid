// components/SplashScreen.tsx
import { useEffect } from 'react';
import styles from './SplashScreen.module.scss';

interface Props {
  onFinish: () => void;
}

const SplashScreen: React.FC<Props> = ({ onFinish }) => {

  const STR = "welcome to to to";
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, STR.length * 500); // 4 giây

    return () => clearTimeout(timer);
  }, [onFinish]);



  return (
    <div className={styles.splash}>
      <h1 className={styles.animatedText}>
        {STR.split('').map((char, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.5}s` }}>
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default SplashScreen;

