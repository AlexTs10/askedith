
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Control } from 'react-hook-form';
import { NewEmailData } from '@/hooks/useNewEmailForm';

interface EmailCcBccFieldsProps {
  control: Control<NewEmailData>;
  showCcBcc: boolean;
  onToggleCcBcc: () => void;
}

const EmailCcBccFields: React.FC<EmailCcBccFieldsProps> = ({
  control,
  showCcBcc,
  onToggleCcBcc
}) => {
  return (
    <>
      {/* CC/BCC Toggle */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleCcBcc}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-800 font-medium"
        >
          {showCcBcc ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Hide CC/BCC
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Add CC/BCC
            </>
          )}
        </Button>
      </div>

      {/* CC/BCC Fields */}
      {showCcBcc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="cc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CC</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </FormControl>
                <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="bcc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BCC</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </FormControl>
                <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

export default EmailCcBccFields;
