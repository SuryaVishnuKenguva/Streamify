import React, { useState, useEffect, useRef } from 'react';

const ImageLoader = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "https://avatar.iran.liara.run/public/1.png",
  preload = true 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [blurAmount, setBlurAmount] = useState(5);
  const [imageSrc, setImageSrc] = useState(src);
  const preloadAttemptedRef = useRef(false);
  const loadedRef = useRef(loaded);
  
  // Keep the ref in sync with the state
  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);
  
  // Reset states when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setBlurAmount(5);
    setImageSrc(src);
    preloadAttemptedRef.current = false;
    loadedRef.current = false;
    
    // Preload image
    if (preload && src) {
      preloadAttemptedRef.current = true;
      const img = new Image();
      img.src = src;
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (!loadedRef.current) {
          console.log("Image preload timed out:", src);
          setError(true);
          setImageSrc(fallbackSrc);
          setLoaded(true);
        }
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeoutId);
        setLoaded(true);
        setImageSrc(src);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        setError(true);
        setImageSrc(fallbackSrc);
        setLoaded(true);
      };
      
      return () => clearTimeout(timeoutId);
    }
  }, [src, fallbackSrc, preload]);

  // Gradually reduce blur as image loads
  useEffect(() => {
    if (loaded) {
      const interval = setInterval(() => {
        setBlurAmount(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 30);

      console.log(error);
      
      return () => clearInterval(interval);
    }
  }, [loaded]);

  // Handle image load event
  const handleImageLoad = () => {
    setLoaded(true);
  };

  // Handle image error
  const handleImageError = () => {
    setError(true);
    setImageSrc(fallbackSrc);
    setLoaded(true);
  };

  return (
    <div className="relative w-full h-full bg-base-300 overflow-hidden">
      {/* Loading spinner shown until image loads or errors */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      )}
      
      {/* Actual image with blur transition effect */}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} w-full h-full object-cover transition-all duration-300 ${loaded ? 'opacity-100' : 'opacity-30'}`}
        style={{ filter: `blur(${blurAmount}px)` }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImageLoader;