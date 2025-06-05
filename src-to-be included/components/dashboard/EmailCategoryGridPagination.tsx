
import React from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';

interface EmailCategoryGridPaginationProps {
  activePage: number;
  totalPages: number;
  showPagination: boolean;
  onPageChange: (page: number) => void;
}

const EmailCategoryGridPagination: React.FC<EmailCategoryGridPaginationProps> = ({
  activePage,
  totalPages,
  showPagination,
  onPageChange
}) => {
  if (!showPagination || totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        {activePage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(activePage - 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
        
        {Array.from({ length: Math.max(totalPages, activePage) }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => onPageChange(page)}
              isActive={page === activePage}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {activePage < Math.max(totalPages, activePage) && (
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(activePage + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default EmailCategoryGridPagination;
