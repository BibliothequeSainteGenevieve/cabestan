import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";

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
					captionLayout="dropdown-buttons"
					fromYear={2010}
					toYear={2024}
					locale={fr}
					classNames={{
						caption_label: "hidden",
						caption_dropdowns: "flex gap-1",
						dropdown: "bg-background text-sm capitalize",
						vhidden: "hidden",
						day_selected: "bg-primary text-white",
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
