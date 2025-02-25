// CUSTOM CALENDAR COMPONENT
// Shadcn version was not updated to the latest version of react-day-picker
// And was not compatible with Tailwind v4

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			captionLayout="dropdown"
			defaultMonth={new Date()}
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				button_previous: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer",
					"absolute left-3 top-3"
				),
				button_next: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer",
					"absolute right-3 top-3"
				),
				caption_label: "hidden",
				day_button: cn(
					buttonVariants({ variant: "ghost" }),
					"h-8 w-8 p-0 font-normal aria-selected:opacity-100 cursor-pointer"
				),
				dropdowns: "flex gap-1 justify-center",
				months_dropdown: "capitalize bg-background",
				month: "space-y-4",
				month_caption: "text-sm font-medium mx-8 capitalize",
				nav: "space-x-1 flex items-center mt-1",
				outside: "opacity-50",
				selected: "bg-primary text-white rounded-md",
				weekdays: "text-sm font-medium capitalize",
				weekday: "pb-2",
				years_dropdown: "capitalize bg-background",
				...classNames,
			}}
			components={{
				Chevron: ({ className, ...props }) => {
					if (props.orientation === "left") {
						return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />;
					}
					return <ChevronRight className={cn("h-4 w-4", className)} {...props} />;
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
