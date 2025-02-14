import { CalendarIcon } from "lucide-react";
import PopoverWithDropdownCalendar from "./PopoverWithDropdownCalendar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSearchParams } from "react-router";

interface DateRangePickerProps {
	type: string;
}

export default function DateRangePicker({ type }: DateRangePickerProps) {
	const [searchParams] = useSearchParams();
	const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
		searchParams.get(`${type}Start`) ? new Date(Number(searchParams.get(`${type}Start`)!)) : undefined
	);
	const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
		searchParams.get(`${type}End`) ? new Date(Number(searchParams.get(`${type}End`)!)) : undefined
	);
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
