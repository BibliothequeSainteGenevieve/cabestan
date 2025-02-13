import { CalendarIcon } from "lucide-react";
import PopoverWithDropdownCalendar from "./PopoverWithDropdownCalendar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
	selectedStartPublicationDate: Date | undefined;
	selectedEndPublicationDate: Date | undefined;
	setSelectedStartPublicationDate: (date: Date | undefined) => void;
	setSelectedEndPublicationDate: (date: Date | undefined) => void;
	label: string;
}

export default function DateRangePicker({
	selectedStartPublicationDate,
	selectedEndPublicationDate,
	setSelectedStartPublicationDate,
	setSelectedEndPublicationDate,
	label,
}: DateRangePickerProps) {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				"bg-white flex items-center gap-1 rounded-md shadow text-sm font-medium px-2",
				(selectedStartPublicationDate || selectedEndPublicationDate) && "bg-lightRed text-primary"
			)}>
			<CalendarIcon />
			{label} :
			<div className="flex items-center gap-0">
				<PopoverWithDropdownCalendar
					date={selectedStartPublicationDate}
					setDate={setSelectedStartPublicationDate}
					label={t("DateRangePicker.startDate")}
				/>
				-
				<PopoverWithDropdownCalendar
					date={selectedEndPublicationDate}
					setDate={setSelectedEndPublicationDate}
					label={t("DateRangePicker.endDate")}
				/>
			</div>
		</div>
	);
}
