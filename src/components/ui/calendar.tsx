"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // ✅ Import nécessaire pour l'affichage des dates
import { EventTooltip } from './EventTooltip'; // n'oublie pas d'importer
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  eventMap?: Record<string, DiscordEvent[]>;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-foreground", className)} // ✅ garantit un texte visible
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-foreground"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
day_today:
  "relative border-2 border-primary text-foreground font-semibold bg-primary/10 rounded-full before:absolute before:inset-0 before:rounded-full before:ring-2 before:ring-primary/40 before:animate-pulse",
        day_outside:
          "day-outside text-muted-foreground opacity-60 aria-selected:bg-accent/50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{

        Day: ({ date, modifiers, ...props }) => {
  const dateKey = date.toDateString();
  const eventsForDay = props.eventMap?.[dateKey] || [];

  return (
    <button
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-foreground"
      )}
      {...props}
    >
      {eventsForDay.length > 0 && (
        <>
          {/* Point rose */}
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
          
          {/* Tooltip simple au hover */}
          <span className="absolute bottom-full mb-1 hidden group-hover:block bg-card text-card-foreground p-1 rounded shadow text-xs z-50">
            {eventsForDay.map(e => e.name).join(", ")}
          </span>
        </>
      )}
    </button>
  );
}

  return (
    <button
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-foreground"
      )}
      style={style}
      {...props}
    >
      {modifiers?.eventDay && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
      )}
    </button>
  );
}
            style={style}
            {...props}
          >
            {/* ✅ Ajout d’un petit point rose pour les jours d’événements */}
            {modifiers?.eventDay && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
            )}
          </button>
        ),
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
