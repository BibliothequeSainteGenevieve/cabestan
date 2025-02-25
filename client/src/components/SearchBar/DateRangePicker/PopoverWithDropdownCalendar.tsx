import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { Calendar } from "./Calendar";

interface PopoverWithDropdownCalendarProps {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	label: string;
	type: string;
}

export default function PopoverWithDropdownCalendar({ date, setDate, label, type }: PopoverWithDropdownCalendarProps) {
	const setFilterSearchParams = useSetFilterSearchParams();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn("bg-transparent px-1 border-none shadow-none w-auto justify-start text-left font-normal")}>
					{date ? format(date, "PPP", { locale: fr }) : <span>{label}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="bg-white w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={(value) => {
						if (value) {
							setDate(value);
							setFilterSearchParams([value.getTime().toString()], type);
						} else {
							setDate(undefined);
							setFilterSearchParams([], type);
						}
					}}
					captionLayout="dropdown"
					locale={fr}
					showOutsideDays={true}
					numberOfMonths={1}
				/>
			</PopoverContent>
		</Popover>
	);
}
