import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterTypes } from "@/models/Filters";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { Check, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

interface PopoverMoreFiltersProps {
	isRegionFilterOpen: boolean;
	setIsRegionFilterOpen: (isOpen: boolean) => void;
	isDepartmentFilterOpen: boolean;
	setIsDepartmentFilterOpen: (isOpen: boolean) => void;
	isCityFilterOpen: boolean;
	setIsCityFilterOpen: (isOpen: boolean) => void;
	isPublisherFilterOpen: boolean;
	setIsPublisherFilterOpen: (isOpen: boolean) => void;
	isPublicationDateFilterOpen: boolean;
	setIsPublicationDateFilterOpen: (isOpen: boolean) => void;
	/* 	isTranslationDateFilterOpen: boolean;
	setIsTranslationDateFilterOpen: (isOpen: boolean) => void; */
	isReissueDateFilterOpen: boolean;
	setIsReissueDateFilterOpen: (isOpen: boolean) => void;
}

export default function PopoverMoreFilters({
	isRegionFilterOpen,
	setIsRegionFilterOpen,
	isDepartmentFilterOpen,
	setIsDepartmentFilterOpen,
	isCityFilterOpen,
	setIsCityFilterOpen,
	isPublisherFilterOpen,
	setIsPublisherFilterOpen,
	isPublicationDateFilterOpen,
	setIsPublicationDateFilterOpen,
	// isTranslationDateFilterOpen,
	// setIsTranslationDateFilterOpen,
	isReissueDateFilterOpen,
	setIsReissueDateFilterOpen,
}: PopoverMoreFiltersProps) {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const setFilterSearchParams = useSetFilterSearchParams();

	const optionalFilters = [
		{
			filter: FilterTypes.REGIONS,
			isOpen: isRegionFilterOpen,
			setIsOpen: setIsRegionFilterOpen,
		},
		{
			filter: FilterTypes.DEPARTMENTS,
			isOpen: isDepartmentFilterOpen,
			setIsOpen: setIsDepartmentFilterOpen,
		},
		{
			filter: FilterTypes.CITIES,
			isOpen: isCityFilterOpen,
			setIsOpen: setIsCityFilterOpen,
		},
		{
			filter: FilterTypes.PUBLISHERS,
			isOpen: isPublisherFilterOpen,
			setIsOpen: setIsPublisherFilterOpen,
		},
		{
			filter: FilterTypes.PUBLICATION_DATES,
			isOpen: isPublicationDateFilterOpen,
			setIsOpen: setIsPublicationDateFilterOpen,
			type: "date",
		},
		/* 		{
			filter: FilterTypes.TRANSLATION_DATES,
			isOpen: isTranslationDateFilterOpen,
			setIsOpen: setIsTranslationDateFilterOpen,
			type: "date",
		}, */
		{
			filter: FilterTypes.REISSUE_DATES,
			isOpen: isReissueDateFilterOpen,
			setIsOpen: setIsReissueDateFilterOpen,
			type: "date",
		},
	];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="bg-white">
					<SlidersHorizontal className="w-4 h-4" />
					<span>{t("PopoverMoreFilters.title")}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-50 bg-white">
				<div className="flex flex-col gap-2">
					{optionalFilters.map((filter) => (
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
