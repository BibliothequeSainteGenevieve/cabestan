import { CalendarIcon } from "lucide-react";
import PopoverWithDropdownCalendar from "./PopoverWithDropdownCalendar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
	selectedStartDate: Date | undefined;
	selectedEndDate: Date | undefined;
	setSelectedStartDate: (date: Date | undefined) => void;
	setSelectedEndDate: (date: Date | undefined) => void;
	type: string;
}

export default function DateRangePicker({
	selectedStartDate,
	selectedEndDate,
	setSelectedStartDate,
	setSelectedEndDate,
	type,
}: DateRangePickerProps) {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				"bg-white flex items-center gap-1 rounded-md shadow text-sm font-medium px-2",
				(selectedStartDate || selectedEndDate) && "bg-lightRed text-primary"
			)}>
			<CalendarIcon />
			{t(`filters.${type}.label`)} :
			<div className="flex items-center gap-0">
				<PopoverWithDropdownCalendar
					type={`${type}Start`}
					date={selectedStartDate}
					setDate={setSelectedStartDate}
					label={t("DateRangePicker.startDate")}
				/>
				-
				<PopoverWithDropdownCalendar
					type={`${type}End`}
					date={selectedEndDate}
					setDate={setSelectedEndDate}
					label={t("DateRangePicker.endDate")}
				/>
			</div>
		</div>
	);
}
