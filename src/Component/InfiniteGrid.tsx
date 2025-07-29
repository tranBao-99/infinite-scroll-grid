import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./InfiniteGrid.module.scss";

const CELL_WIDTH = 400;
const CELL_HEIGHT = 300;
const GAP = 50; // Khoảng cách giữa các ảnh
const VIRTUAL_SIZE = 100; // 100x100 virtual grid
const BUFFER = 2; // Extra tiles to render outside viewport

const images = Array.from({ length: 30}, (_, i) => `https://picsum.photos/seed/${i}/600/400`);

export default function InfiniteGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Initialize scroll position to center
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      const totalWidth = (CELL_WIDTH + GAP) * VIRTUAL_SIZE - GAP;
      const totalHeight = (CELL_HEIGHT + GAP) * VIRTUAL_SIZE - GAP;
      const centerX = totalWidth / 2 - el.clientWidth / 2;
      const centerY = totalHeight / 2 - el.clientHeight / 2;
      el.scrollLeft = centerX;
      el.scrollTop = centerY;
      
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    }
  }, []);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({ 
          width: containerRef.current.clientWidth, 
          height: containerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag to scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    setScrollStart({
      x: containerRef.current.scrollLeft,
      y: containerRef.current.scrollTop
    });

    // Prevent text selection and image dragging
    e.preventDefault();
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    containerRef.current.scrollLeft = scrollStart.x - deltaX;
    containerRef.current.scrollTop = scrollStart.y - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  // Global mouse event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragStart, scrollStart]);

  const onScroll = () => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const totalWidth = (CELL_WIDTH + GAP) * VIRTUAL_SIZE - GAP;
    const totalHeight = (CELL_HEIGHT + GAP) * VIRTUAL_SIZE - GAP;
    const maxScrollLeft = totalWidth - el.clientWidth;
    const maxScrollTop = totalHeight - el.clientHeight;

    // Reset threshold (when to jump back to center)
    const threshold = 0.1; // 10% from edges

    let newScrollLeft = el.scrollLeft;
    let newScrollTop = el.scrollTop;
    let shouldReset = false;

    // Check horizontal bounds
    if (el.scrollLeft < maxScrollLeft * threshold) {
      newScrollLeft = maxScrollLeft / 2;
      shouldReset = true;
    } else if (el.scrollLeft > maxScrollLeft * (1 - threshold)) {
      newScrollLeft = maxScrollLeft / 2;
      shouldReset = true;
    }

    // Check vertical bounds
    if (el.scrollTop < maxScrollTop * threshold) {
      newScrollTop = maxScrollTop / 2;
      shouldReset = true;
    } else if (el.scrollTop > maxScrollTop * (1 - threshold)) {
      newScrollTop = maxScrollTop / 2;
      shouldReset = true;
    }

    if (shouldReset) {
      el.scrollLeft = newScrollLeft;
      el.scrollTop = newScrollTop;
    }

    setScrollPos({ x: el.scrollLeft, y: el.scrollTop });
  };

  // Calculate visible range with virtualization
  const getVisibleTiles = () => {
    if (!containerSize.width || !containerSize.height) return [];

    const cellTotalWidth = CELL_WIDTH + GAP;
    const cellTotalHeight = CELL_HEIGHT + GAP;

    const startCol = Math.max(0, Math.floor(scrollPos.x / cellTotalWidth) - BUFFER);
    const endCol = Math.min(VIRTUAL_SIZE - 1, Math.floor((scrollPos.x + containerSize.width) / cellTotalWidth) + BUFFER);
    const startRow = Math.max(0, Math.floor(scrollPos.y / cellTotalHeight) - BUFFER);
    const endRow = Math.min(VIRTUAL_SIZE - 1, Math.floor((scrollPos.y + containerSize.height) / cellTotalHeight) + BUFFER);

    const tiles = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const key = row * VIRTUAL_SIZE + col;
        const img = images[key % images.length];
        tiles.push({
          key,
          row,
          col,
          img,
          left: col * cellTotalWidth,
          top: row * cellTotalHeight,
        });
      }
    }
    return tiles;
  };

  const visibleTiles = getVisibleTiles();

  return (
    <div 
      ref={containerRef} 
      onScroll={onScroll}
      onMouseDown={handleMouseDown}
      className={styles.wrapper}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      <div
        className={styles.grid}
        style={{ 
          width: (CELL_WIDTH + GAP) * VIRTUAL_SIZE - GAP, 
          height: (CELL_HEIGHT + GAP) * VIRTUAL_SIZE - GAP
        }}
      >
        {visibleTiles.map(tile => (
          <div
            key={tile.key}
            className={styles.tile}
            style={{
              left: `${tile.left}px`,
              top: `${tile.top}px`,
              width: `${CELL_WIDTH}px`,
              height: `${CELL_HEIGHT}px`,
              position: "absolute",
              pointerEvents: isDragging ? 'none' : 'auto', // Prevent image drag during scroll drag
            }}
          >
            <Image
              src={tile.img}
              alt={`Tile ${tile.key}`}
              width={CELL_WIDTH}
              height={CELL_HEIGHT}
              loading="lazy"
              style={{ 
                objectFit: "cover",
                userSelect: 'none',
                pointerEvents: 'none' // Prevent image drag
              }}
              draggable={false} // Prevent image dragging
            />
          </div>
        ))}
      </div>
      
      {/* Debug info */}
      {/* <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        color: '#333',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div>Scroll: ({Math.round(scrollPos.x)}, {Math.round(scrollPos.y)})</div>
        <div>Visible tiles: {visibleTiles.length}</div>
        <div>Container: {containerSize.width}×{containerSize.height}</div>
        <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
      </div> */}
    </div>
  );
}