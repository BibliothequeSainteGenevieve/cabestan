import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PopoverMoreFiltersProps {
	isRegionFilterOpen: boolean;
	setIsRegionFilterOpen: (isOpen: boolean) => void;
	setSelectedRegions: (regions: string[]) => void;
	isDepartmentFilterOpen: boolean;
	setIsDepartmentFilterOpen: (isOpen: boolean) => void;
	setSelectedDepartments: (departments: string[]) => void;
	isCityFilterOpen: boolean;
	setIsCityFilterOpen: (isOpen: boolean) => void;
	setSelectedCities: (cities: string[]) => void;
	isPublisherFilterOpen: boolean;
	setIsPublisherFilterOpen: (isOpen: boolean) => void;
	setSelectedPublishers: (publishers: string[]) => void;
	isPublicationDateFilterOpen: boolean;
	setIsPublicationDateFilterOpen: (isOpen: boolean) => void;
	setSelectedStartPublicationDate: (date: Date | undefined) => void;
	setSelectedEndPublicationDate: (date: Date | undefined) => void;
}

export default function PopoverMoreFilters({
	isRegionFilterOpen,
	setIsRegionFilterOpen,
	setSelectedRegions,
	isDepartmentFilterOpen,
	setIsDepartmentFilterOpen,
	setSelectedDepartments,
	isCityFilterOpen,
	setIsCityFilterOpen,
	setSelectedCities,
	isPublisherFilterOpen,
	setIsPublisherFilterOpen,
	setSelectedPublishers,
	isPublicationDateFilterOpen,
	setIsPublicationDateFilterOpen,
	setSelectedStartPublicationDate,
	setSelectedEndPublicationDate,
}: PopoverMoreFiltersProps) {
	const { t } = useTranslation();
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
							setSelectedRegions([]);
						}}>
						Région
						{isRegionFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsDepartmentFilterOpen(!isDepartmentFilterOpen);
							setSelectedDepartments([]);
						}}>
						Département
						{isDepartmentFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsCityFilterOpen(!isCityFilterOpen);
							setSelectedCities([]);
						}}>
						Ville
						{isCityFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsPublisherFilterOpen(!isPublisherFilterOpen);
							setSelectedPublishers([]);
						}}>
						Editeur
						{isPublisherFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button
						variant="ghost"
						onClick={() => {
							setIsPublicationDateFilterOpen(!isPublicationDateFilterOpen);
							setSelectedStartPublicationDate(undefined);
							setSelectedEndPublicationDate(undefined);
						}}>
						Date de publication
						{isPublicationDateFilterOpen && <Check className="w-4 h-4" />}
					</Button>
					<Button variant="ghost">Date de traduction</Button>
					<Button variant="ghost">Date de réédition</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
