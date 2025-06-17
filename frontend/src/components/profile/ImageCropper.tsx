import { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCrop: (croppedImage: string) => void;
  aspectRatio?: number;
  showCropper?: boolean;
}

export function ImageCropper({ image, onCrop, aspectRatio = 3/4 }: ImageCropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(prev => Math.min(Math.max(1, prev + delta), 3));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Mouse move and up handlers are now defined inside the effect

  // Add/remove event listeners for mouse move/up
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - startPos.x;
      const y = e.clientY - startPos.y;
      
      if (containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        const maxX = (scale - 1) * container.width / 2;
        const maxY = (scale - 1) * container.height / 2;
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, x)),
          y: Math.max(-maxY, Math.min(maxY, y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale, startPos]);

  // Create a canvas to crop the image
  const handleCrop = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image;
    
    img.onload = () => {
      // Set canvas dimensions to match the container
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
      
      // Calculate the scaled image dimensions
      const imgAspectRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imgAspectRatio > aspectRatio) {
        // Image is wider than container
        drawHeight = img.height * scale;
        drawWidth = drawHeight * aspectRatio;
        offsetX = (img.width - drawWidth) / 2 + position.x * (img.width / containerRect.width);
        offsetY = position.y * (img.height / containerRect.height);
      } else {
        // Image is taller than container
        drawWidth = img.width * scale;
        drawHeight = drawWidth / aspectRatio;
        offsetX = position.x * (img.width / containerRect.width);
        offsetY = (img.height - drawHeight) / 2 + position.y * (img.height / containerRect.height);
      }
      
      // Draw the cropped image
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
        0,
        0,
        containerRect.width,
        containerRect.height
      );
      
      // Convert canvas to data URL and call onCrop
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      onCrop(croppedImage);
    };
  }, [image, scale, position, aspectRatio, onCrop]);

  // Handle crop when component unmounts
  useEffect(() => {
    const currentHandleCrop = handleCrop;
    return () => {
      currentHandleCrop();
    };
  }, [handleCrop]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{
        aspectRatio: aspectRatio,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          touchAction: 'none',
          width: '100%',
          height: '100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Rule of Thirds Grid - Enhanced visibility */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
        <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale(prev => Math.max(1, prev - 0.1));
          }}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale(prev => Math.min(3, prev + 0.1));
          }}
          className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
