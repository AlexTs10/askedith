
import React, { useMemo, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useEmailPreview } from '../../hooks/useEmailPreview';
import { useFilteredEmailData } from '../../hooks/useFilteredEmailData';
import { useTooltipBehavior } from '../../hooks/useTooltipBehavior';
import { useAccordionBehavior } from '../../hooks/useAccordionBehavior';
import { useScrollBehavior } from '../../hooks/useScrollBehavior';
import EmailPreviewTooltip from '../email-category/EmailPreviewTooltip';
import CompactCategoryHeader from './CompactCategoryHeader';
import CompactCategoryContent from './CompactCategoryContent';

interface EmailCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  unread: number;
  pending: number;
  total: number;
  color: string;
  bgColor: string;
  textColor: string;
}

interface CompactCategoryItemProps {
  category: EmailCategory;
}

const CompactCategoryItem: React.FC<CompactCategoryItemProps> = ({ category }) => {
  const { id, title, unread, pending, total, color } = category;
  const navigate = useNavigate();
  
  // Custom hooks
  const { isScrollLocked, containerRef, cleanup: cleanupScroll } = useScrollBehavior(false);
  const { 
    isExpanded, 
    handleHeaderHover, 
    handleHeaderLeave, 
    handleHeaderClick,
    cleanup: cleanupAccordion 
  } = useAccordionBehavior(isScrollLocked);
  
  const {
    hoveredStatus,
    tooltipPosition,
    handleStatusHover,
    handleStatusLeave,
    handleTooltipClose,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
    cleanup: cleanupTooltip
  } = useTooltipBehavior();
  
  // Get the actual count of unresponded emails for this category
  const { getFilteredUnrespondedEmails } = useFilteredEmailData();
  const notRespondedCount = useMemo(() => {
    return getFilteredUnrespondedEmails(id).length;
  }, [id, getFilteredUnrespondedEmails]);
  
  // Get preview emails for the currently hovered status
  const { previewEmails } = useEmailPreview({ 
    category: id, 
    status: hoveredStatus || 'unread' 
  });

  // Debug logging for category data
  useEffect(() => {
    console.log('📧 Category Debug:', {
      categoryId: id,
      categoryTitle: title,
      pendingCount: pending,
      unreadCount: unread,
      notRespondedCount,
      totalCount: total
    });
  }, [id, title, pending, unread, notRespondedCount, total]);

  // Debug logging for preview emails
  useEffect(() => {
    if (hoveredStatus) {
      console.log('🔍 Preview Debug:', {
        categoryId: id,
        hoveredStatus,
        previewEmailsCount: previewEmails.length,
        previewEmails: previewEmails.map(email => ({
          id: email.id,
          subject: email.subject,
          read: email.read,
          replied: email.replied,
          responseReceived: email.responseReceived
        }))
      });
    }
  }, [hoveredStatus, previewEmails, id]);

  // Update scroll behavior hook with current expansion state
  const { cleanup: cleanupScrollWithExpansion } = useScrollBehavior(isExpanded);

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      cleanupScroll();
      cleanupAccordion();
      cleanupTooltip();
      cleanupScrollWithExpansion();
    };
  }, [cleanupScroll, cleanupAccordion, cleanupTooltip, cleanupScrollWithExpansion]);

  const handleCardContentClick = () => {
    // Only allow navigation from the card content, not the header
    navigate(`/emails/${id}/all`);
  };

  const handleStatusClick = (status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/emails/${id}/${status}`);
  };

  const onStatusHover = (status: 'unread' | 'pending' | 'unresponded', e: React.MouseEvent) => {
    handleStatusHover(status, e, id, pending);
  };

  return (
    <>
      <div className="space-y-0" ref={containerRef}>
        {/* Compact Header */}
        <CompactCategoryHeader 
          category={category}
          isExpanded={isExpanded}
          onHeaderClick={handleHeaderClick}
          onHeaderHover={handleHeaderHover}
          onHeaderLeave={handleHeaderLeave}
          notRespondedCount={notRespondedCount}
        />

        {/* Expanded Content */}
        <CompactCategoryContent 
          category={category}
          isExpanded={isExpanded}
          notRespondedCount={notRespondedCount}
          onStatusClick={handleStatusClick}
          onStatusHover={onStatusHover}
          onStatusLeave={handleStatusLeave}
          onCardContentClick={handleCardContentClick}
        />
      </div>

      {/* Email Preview Tooltip */}
      {hoveredStatus && previewEmails.length > 0 && createPortal(
        <div data-tooltip="email-preview">
          <EmailPreviewTooltip
            emails={previewEmails}
            status={hoveredStatus}
            category={id}
            position={tooltipPosition}
            onClose={handleTooltipClose}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            categoryColor={color}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default CompactCategoryItem;
