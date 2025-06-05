
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Send, X } from 'lucide-react';
import { useNewEmailForm, NewEmailData } from '@/hooks/useNewEmailForm';
import CustomCategoryDialog from '@/components/forms/CustomCategoryDialog';
import EmailAttachmentsSection from '@/components/forms/EmailAttachmentsSection';
import EmailCcBccFields from '@/components/forms/EmailCcBccFields';

interface NewEmailFormProps {
  onClose: () => void;
  onSend: (emailData: NewEmailData) => void;
  isOpen: boolean;
}

const NewEmailForm: React.FC<NewEmailFormProps> = ({ 
  onClose, 
  onSend,
  isOpen 
}) => {
  const [showCustomCategoryDialog, setShowCustomCategoryDialog] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);
  
  const {
    form,
    isSubmitting,
    availableCategories,
    attachments,
    setAttachments,
    handleAddCustomCategory,
    handleCategoryChange,
    handleSubmit
  } = useNewEmailForm(isOpen, onSend, onClose);

  const handleFileSelect = (files: FileList) => {
    const newAttachments = Array.from(files);
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    form.setValue('attachments', updatedAttachments);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(updatedAttachments);
    form.setValue('attachments', updatedAttachments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-medium">Compose New Email</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="to"
                  rules={{ required: "Email address is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Email *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="recipient@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toName"
                  rules={{ required: "Recipient name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="John Doe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="toOrganization"
                rules={{ required: "Organization is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Healthcare Center"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EmailCcBccFields
                control={form.control}
                showCcBcc={showCcBcc}
                onToggleCcBcc={() => setShowCcBcc(!showCcBcc)}
              />
              
              <FormField
                control={form.control}
                name="subject"
                rules={{ required: "Subject is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter email subject"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        onValueChange={(value) => handleCategoryChange(value, () => setShowCustomCategoryDialog(true))} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={field.value === 'add-custom' ? 'bg-purple-500 text-white border-purple-500' : ''}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                          <SelectItem value="add-custom" className="text-purple-600 font-medium">
                            Add your own category
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Private Email</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Only primary caregivers can see this
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <EmailAttachmentsSection
                attachments={attachments}
                onFileSelect={handleFileSelect}
                onRemoveAttachment={removeAttachment}
              />
              
              <FormField
                control={form.control}
                name="content"
                rules={{ required: "Message content is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={8}
                        className="resize-none"
                        placeholder="Type your message here..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-1 h-4 w-4" /> Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CustomCategoryDialog
          isOpen={showCustomCategoryDialog}
          onOpenChange={setShowCustomCategoryDialog}
          onAddCategory={handleAddCustomCategory}
        />
      </Card>
    </div>
  );
};

export default NewEmailForm;
