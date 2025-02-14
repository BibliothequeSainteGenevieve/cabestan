import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { Check, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

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
	isTranslationDateFilterOpen: boolean;
	setIsTranslationDateFilterOpen: (isOpen: boolean) => void;
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
	isTranslationDateFilterOpen,
	setIsTranslationDateFilterOpen,
	isReissueDateFilterOpen,
	setIsReissueDateFilterOpen,
}: PopoverMoreFiltersProps) {
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

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
					<Button
						variant="ghost"
						onClick={() => {
							setIsRegionFilterOpen(!isRegionFilterOpen);
							setFilterSearchParams([], "regions");
						}}>
						{t("filters.regions.placeholder")}
						{isRegionFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsDepartmentFilterOpen(!isDepartmentFilterOpen);
							setFilterSearchParams([], "departments");
						}}>
						{t("filters.departments.placeholder")}
						{isDepartmentFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsCityFilterOpen(!isCityFilterOpen);
							setFilterSearchParams([], "cities");
						}}>
						{t("filters.cities.placeholder")}
						{isCityFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsPublisherFilterOpen(!isPublisherFilterOpen);
							setFilterSearchParams([], "publishers");
						}}>
						{t("filters.publishers.placeholder")}
						{isPublisherFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsPublicationDateFilterOpen(!isPublicationDateFilterOpen);
							setFilterSearchParams([], "publicationDatesStart");
							setFilterSearchParams([], "publicationDatesEnd");
						}}>
						{t("filters.publicationDates.placeholder")}
						{isPublicationDateFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsTranslationDateFilterOpen(!isTranslationDateFilterOpen);
							setFilterSearchParams([], "translationDatesStart");
							setFilterSearchParams([], "translationDatesEnd");
						}}>
						{t("filters.translationDates.placeholder")}
						{isTranslationDateFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsReissueDateFilterOpen(!isReissueDateFilterOpen);
							setFilterSearchParams([], "reissueDatesStart");
							setFilterSearchParams([], "reissueDatesEnd");
						}}>
						{t("filters.reissueDates.placeholder")}
						{isReissueDateFilterOpen && <Check className="w-4 h-4" />}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
