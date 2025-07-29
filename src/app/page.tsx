// pages/index.tsx
"use client";
import InfiniteGrid from '@/Component/InfiniteGrid/InfiniteGrid';
import SplashScreen from '@/Component/SplashScreen/SplashScreen';
import { useState } from 'react';


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <SplashScreen onFinish={() => setIsLoading(false)} />}

      {!isLoading && (
        <InfiniteGrid />
      )}
    </>
  );
}
