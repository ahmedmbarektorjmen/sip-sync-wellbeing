
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onRemove: (id: string) => void;
  isMobile: boolean;
}

const SwipeableToast: React.FC<SwipeableToastProps> = ({ 
  id, 
  title, 
  description, 
  variant = 'default',
  onRemove,
  isMobile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const toastRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow dragging in the dismiss direction
    if (isMobile && deltaY > 0) {
      setDragY(deltaY);
    } else if (!isMobile && deltaY < 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 80;
    const shouldDismiss = isMobile ? dragY > threshold : dragY < -threshold;
    
    if (shouldDismiss) {
      onRemove(id);
    } else {
      setDragY(0);
    }
    
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startY;
    
    if (isMobile && deltaY > 0) {
      setDragY(deltaY);
    } else if (!isMobile && deltaY < 0) {
      setDragY(deltaY);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 80;
    const shouldDismiss = isMobile ? dragY > threshold : dragY < -threshold;
    
    if (shouldDismiss) {
      onRemove(id);
    } else {
      setDragY(0);
    }
    
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startY]);

  return (
    <div
      ref={toastRef}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all duration-200 cursor-grab",
        isDragging && "cursor-grabbing",
        variant === 'default' && "border bg-background text-foreground",
        variant === 'destructive' && "destructive group border-destructive bg-destructive text-destructive-foreground"
      )}
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: Math.max(0.3, 1 - Math.abs(dragY) / 200)
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="grid gap-1">
        {title && (
          <div className="text-sm font-semibold">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      
      <button
        onClick={() => onRemove(id)}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
          variant === 'destructive' && "text-red-300 hover:text-red-50 focus:ring-red-400"
        )}
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Swipe indicator */}
      <div className={cn(
        "absolute left-1/2 transform -translate-x-1/2 w-8 h-1 bg-muted-foreground/30 rounded-full",
        isMobile ? "top-1" : "bottom-1"
      )} />
    </div>
  );
};

const CustomToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={cn(
      "fixed z-[100] flex max-h-screen w-full flex-col p-4 space-y-2",
      isMobile 
        ? "bottom-20 left-0 right-0 items-center" 
        : "top-20 right-0 items-end max-w-[420px]"
    )}>
      {toasts.map((toast) => (
        <SwipeableToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant as 'default' | 'destructive'}
          onRemove={dismiss}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

export default CustomToastContainer;
