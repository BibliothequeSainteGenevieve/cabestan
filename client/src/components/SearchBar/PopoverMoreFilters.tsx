import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OptionalFilter } from "@/models/Filters";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { Check, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

interface PopoverMoreFiltersProps {
	filters: OptionalFilter[];
}

export default function PopoverMoreFilters({ filters }: PopoverMoreFiltersProps) {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const setFilterSearchParams = useSetFilterSearchParams();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="foreground">
					<SlidersHorizontal className="w-4 h-4" />
					<span>{t("PopoverMoreFilters.title")}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-50 bg-white">
				<div className="flex flex-col gap-2">
					{filters.map((filter) => (
						<Button
							key={filter.filter}
							variant="ghost"
							onClick={() => {
								filter.setIsOpen(!filter.isOpen);
								if (filter.type === "date") {
									if (searchParams.get(`${filter.filter}Start`)) {
										setFilterSearchParams([], `${filter.filter}Start`);
									}
									if (searchParams.get(`${filter.filter}End`)) {
										setFilterSearchParams([], `${filter.filter}End`);
									}
								} else {
									if (searchParams.get(filter.filter)) {
										setFilterSearchParams([], filter.filter);
									}
								}
							}}>
							{t(`filters.${filter.filter}.placeholder`)}
							{filter.isOpen && <Check className="w-4 h-4" />}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
