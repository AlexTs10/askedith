
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { getAllCategories, addCustomCategory } from '@/utils/categoryUtils';

export interface NewEmailData {
  to: string;
  toName: string;
  toOrganization: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  category: string;
  isPrivate: boolean;
  attachments: File[];
}

export const useNewEmailForm = (isOpen: boolean, onSend: (data: NewEmailData) => void, onClose: () => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; title: string }[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const form = useForm<NewEmailData>({
    defaultValues: {
      to: '',
      toName: '',
      toOrganization: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      category: '',
      isPrivate: false,
      attachments: []
    }
  });

  // Load available categories (predefined + custom)
  useEffect(() => {
    const allCategories = getAllCategories();
    const categoryList = Object.entries(allCategories).map(([id, data]) => ({
      id,
      title: data.title
    }));
    setAvailableCategories(categoryList);
  }, [isOpen]);

  const handleAddCustomCategory = (newCategoryName: string) => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = addCustomCategory(newCategoryName.trim());
        
        // Update available categories
        const allCategories = getAllCategories();
        const categoryList = Object.entries(allCategories).map(([id, data]) => ({
          id,
          title: data.title
        }));
        setAvailableCategories(categoryList);
        
        // Set the new category as selected
        form.setValue('category', newCategory.id);
        
        toast({
          title: "Category Added",
          description: `"${newCategoryName.trim()}" has been added as a new category.`,
        });
        
        return true;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create category. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    }
    return false;
  };

  const handleCategoryChange = (value: string, onShowCustomDialog: () => void) => {
    if (value === 'add-custom') {
      onShowCustomDialog();
    } else {
      form.setValue('category', value);
    }
  };

  const handleSubmit = async (data: NewEmailData) => {
    setIsSubmitting(true);
    
    try {
      console.log('New email data to be sent via Nylas:', {
        ...data,
        ccEmails: data.cc ? data.cc.split(',').map(email => email.trim()).filter(email => email) : [],
        bccEmails: data.bcc ? data.bcc.split(',').map(email => email.trim()).filter(email => email) : [],
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      });
      
      // Simulate sending (replace with actual Nylas integration)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSend({ ...data, attachments });
      
      toast({
        title: "Email Sent",
        description: `Your email has been sent successfully${attachments.length > 0 ? ` with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}.` : '.'}`,
      });
      
      form.reset();
      setAttachments([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    availableCategories,
    attachments,
    setAttachments,
    handleAddCustomCategory,
    handleCategoryChange,
    handleSubmit
  };
};
