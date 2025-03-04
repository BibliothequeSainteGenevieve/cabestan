import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { CommandSearch } from "./SearchInput";
import ComboboxFilter from "./ComboboxFilter";
import PopoverMoreFilters from "./PopoverMoreFilters";
import DateRangePicker from "./DateRangePicker";
import { getClientConfig } from "@/api";
import ComboboxSearchFilter from "./ComboboxSearchFilter";
import { OptionalFilter, FilterTypes } from "@/models/Filters";
import ResetFiltersButton from "./ResetFiltersButton";
import SwitchNullValues from "./SwitchNullValues";

export default function RCRSearchBar() {
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

	const [isRegionFilterOpen, setIsRegionFilterOpen] = useState(searchParams.get("regions") ? true : false);
	const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(searchParams.get("departments") ? true : false);
	const [isCityFilterOpen, setIsCityFilterOpen] = useState(searchParams.get("cities") ? true : false);
	const [isPublisherFilterOpen, setIsPublisherFilterOpen] = useState(searchParams.get("publishers") ? true : false);
	const [isPublicationDateFilterOpen, setIsPublicationDateFilterOpen] = useState(
		searchParams.get("publicationDatesStart") || searchParams.get("publicationDatesEnd") ? true : false
	);
	/* 	const [isTranslationDateFilterOpen, setIsTranslationDateFilterOpen] = useState(
		searchParams.get("translationDatesStart") || searchParams.get("translationDatesEnd") ? true : false
	); */
	const [isReissueDateFilterOpen, setIsReissueDateFilterOpen] = useState(
		searchParams.get("reissueDatesStart") || searchParams.get("reissueDatesEnd") ? true : false
	);

	const optionalFilters: OptionalFilter[] = [
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

	if (isLoading || !data) return <div>{t("SearchBar.loading")}</div>;
	if (error) return <div>{t("SearchBar.error", { error: error })}</div>;

	const isResetButtonVisible =
		searchParams.size > 0 &&
		!(
			(searchParams.size === 1 && (searchParams.get("page") || searchParams.get("itemsPerPage"))) ||
			(searchParams.size === 2 && searchParams.get("page") && searchParams.get("itemsPerPage"))
		);

	return (
		<div>
			<div className="flex flex-wrap items-center gap-3">
				<CommandSearch />
				<div className="flex flex-wrap lg:flex-nowrap items-center justify-between flex-1 gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<ComboboxFilter type={FilterTypes.LANGUAGES} options={data.languages} />
						<ComboboxFilter type={FilterTypes.ESTABLISHMENTS_TYPES} options={data.establishementsTypes} />
						<ComboboxFilter type={FilterTypes.BOOKS_TYPES} options={data.documentsTypes} />
						{isRegionFilterOpen && <ComboboxFilter type={FilterTypes.REGIONS} options={data.regions} />}
						{isDepartmentFilterOpen && <ComboboxFilter type={FilterTypes.DEPARTMENTS} options={data.departments} />}
						{isCityFilterOpen && <ComboboxSearchFilter type={FilterTypes.CITIES} />}
						{isPublisherFilterOpen && <ComboboxSearchFilter type={FilterTypes.PUBLISHERS} />}
						{isPublicationDateFilterOpen && <DateRangePicker type={FilterTypes.PUBLICATION_DATES} />}
						{/* {isTranslationDateFilterOpen && <DateRangePicker type={FilterTypes.TRANSLATION_DATES} />} */}
						{isReissueDateFilterOpen && <DateRangePicker type={FilterTypes.REISSUE_DATES} />}
						{isResetButtonVisible && <ResetFiltersButton />}
					</div>
					<div className="">
						<PopoverMoreFilters filters={optionalFilters} />
					</div>
				</div>
			</div>
			<SwitchNullValues />
		</div>
	);
}
