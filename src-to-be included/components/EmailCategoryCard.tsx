
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useEmailPreview } from '../hooks/useEmailPreview';
import { useFilteredEmailData } from '../hooks/useFilteredEmailData';
import { EmailCategory } from '../hooks/useEmailCategoryData';
import EmailPreviewTooltip from './email-category/EmailPreviewTooltip';
import EmailCategoryCardHeader from './email-category/EmailCategoryCardHeader';
import EmailCategoryCardContent from './email-category/EmailCategoryCardContent';
import EmailCategoryCardDragHandle from './email-category/EmailCategoryCardDragHandle';

interface EmailCategoryCardProps {
  category: EmailCategory;
  isExpanded?: boolean;
  onToggle?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, categoryId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const EmailCategoryCard: React.FC<EmailCategoryCardProps> = ({ 
  category, 
  isExpanded: externalIsExpanded,
  onToggle: externalOnToggle,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const { id, title, icon: Icon, unread, pending, total, color, bgColor, textColor } = category;
  const navigate = useNavigate();
  const categoryCardRef = useRef<HTMLDivElement>(null);
  const [hoveredStatus, setHoveredStatus] = useState<'unread' | 'pending' | 'unresponded' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Use external state if provided, otherwise use internal state
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const onToggle = externalOnToggle || (() => setInternalIsExpanded(!internalIsExpanded));
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const expandTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Get the actual count of unresponded emails for this category
  const { getFilteredUnrespondedEmails } = useFilteredEmailData();
  const notRespondedCount = useMemo(() => {
    return getFilteredUnrespondedEmails(id).length;
  }, [id, getFilteredUnrespondedEmails]);
  
  // Calculate total items needing attention
  const totalNeedingAttention = unread + pending + notRespondedCount;
  
  // Get preview emails for the currently hovered status
  const { previewEmails } = useEmailPreview({ 
    category: id, 
    status: hoveredStatus || 'unread' 
  });
  
  const handleCardClick = () => {
    navigate(`/emails/${id}/all`);
  };
  
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleHeaderHover = useCallback(() => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }
    
    // Only auto-expand if using internal state (not externally controlled)
    if (externalIsExpanded === undefined) {
      expandTimeoutRef.current = setTimeout(() => {
        setInternalIsExpanded(true);
      }, 300);
    }
  }, [externalIsExpanded]);

  const handleHeaderLeave = useCallback(() => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }
    // Don't auto-close on leave - stays open until manually closed
  }, []);

  const handleStatusClick = (status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/emails/${id}/${status}`);
  };

  const handleStatusHover = useCallback((status: 'unread' | 'pending' | 'unresponded', event: React.MouseEvent) => {
    // Don't show tooltip hover when card is collapsed
    if (!isExpanded) {
      return;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top
    };

    hoverTimeoutRef.current = setTimeout(() => {
      setTooltipPosition(position);
      setHoveredStatus(status);
    }, 800);
  }, [isExpanded]);

  const handleStatusLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredStatus(null);
    }, 300);
  }, []);

  const handleTooltipClose = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setHoveredStatus(null);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  // Create array of active statuses (only show rows with activity)
  const activeStatuses = [
    ...(unread > 0 ? [{
      label: 'Unread messages',
      count: unread,
      color: 'bg-purple-500',
      status: 'unread' as const,
      navStatus: 'unread'
    }] : []),
    ...(pending > 0 ? [{
      label: 'Pending replies',
      count: pending,
      color: 'bg-amber-500',
      status: 'pending' as const,
      navStatus: 'pending'
    }] : []),
    ...(notRespondedCount > 0 ? [{
      label: 'Not replied yet',
      count: notRespondedCount,
      color: 'bg-red-500',
      status: 'unresponded' as const,
      navStatus: 'no-response'
    }] : [])
  ];
  
  return (
    <>
      <div 
        ref={categoryCardRef}
        draggable
        onDragStart={(e) => onDragStart?.(e, id)}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group hover:translate-y-[-4px] flex flex-col ${
          isExpanded ? 'p-4 sm:p-5' : 'p-2 sm:p-3'
        } ${isDragging ? 'opacity-50 scale-95 rotate-1' : ''} ${
          isDragOver ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
        } relative`}
        onClick={handleCardClick}
      >
        {/* Drag handle */}
        <EmailCategoryCardDragHandle />

        {/* Header */}
        <EmailCategoryCardHeader
          title={title}
          icon={Icon}
          bgColor={bgColor}
          textColor={textColor}
          isExpanded={isExpanded}
          totalNeedingAttention={totalNeedingAttention}
          onHeaderClick={handleHeaderClick}
          onHeaderHover={handleHeaderHover}
          onHeaderLeave={handleHeaderLeave}
        />

        {/* Accordion Content */}
        <EmailCategoryCardContent
          isExpanded={isExpanded}
          activeStatuses={activeStatuses}
          unread={unread}
          pending={pending}
          total={total}
          color={color}
          onStatusClick={handleStatusClick}
          onStatusHover={handleStatusHover}
          onStatusLeave={handleStatusLeave}
        />
      </div>

      {/* Email Preview Tooltip */}
      {hoveredStatus && previewEmails.length > 0 && createPortal(
        <EmailPreviewTooltip
          emails={previewEmails}
          status={hoveredStatus}
          category={id}
          position={tooltipPosition}
          onClose={handleTooltipClose}
          onMouseEnter={handleTooltipMouseEnter}
          categoryColor={color}
          categoryCardRef={categoryCardRef}
        />,
        document.body
      )}
    </>
  );
};

export default EmailCategoryCard;
