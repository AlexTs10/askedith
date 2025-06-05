
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto w-full min-w-[300px]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full justify-center",
        month: "space-y-6 w-full min-w-[280px]",
        caption: "flex justify-center pt-1 relative items-center mb-4 w-full",
        caption_label: "text-2xl font-light text-gray-500",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border-0"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2 min-w-[260px]",
        head_row: "flex w-full mt-6 justify-between border-b border-gray-200 pb-2",
        head_cell:
          "text-gray-400 rounded-md font-light text-[0.9rem] h-10 flex items-center justify-center uppercase flex-1 min-w-[35px]",
        row: "flex w-full mt-4 justify-between border-t border-gray-100 pt-2",
        cell: "h-14 text-center text-sm p-0 relative flex items-center justify-center flex-1 min-w-[35px] [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "pointer-events-auto h-12 w-12 p-0 font-normal text-base rounded-full hover:bg-green-100 text-gray-600 mx-auto aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected:
          "bg-green-500 hover:bg-green-600 text-white focus:bg-green-600 focus:text-white rounded-full",
        day_today: "bg-green-500 hover:bg-green-600 text-white rounded-full !important",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      styles={{
        day: {
          margin: '2px',
          pointerEvents: 'auto',
          minWidth: '48px',
          minHeight: '48px',
        },
        caption: {
          marginBottom: '24px',
        },
        month: {
          width: '100%',
          minWidth: '280px',
        },
        months: {
          width: '100%',
          minWidth: '300px',
        },
        table: {
          width: '100%',
          minWidth: '260px',
        },
        head_cell: {
          width: 'auto',
          minWidth: '35px',
        },
        cell: {
          width: 'auto',
          height: '56px',
          minWidth: '35px',
          pointerEvents: 'auto',
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
