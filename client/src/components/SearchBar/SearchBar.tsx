import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { CommandSearch } from "./SearchInput/SearchInput";
import ComboboxFilter from "./ComboboxFilter";
import PopoverMoreFilters from "./PopoverMoreFilters";
import DateRangePicker from "./DateRangePicker/DateRangePicker";
import { getClientConfig } from "@/api";
import ComboboxSearchFilter from "./ComboboxSearchFilter/ComoboxSearchFilter";

export default function SearchBar() {
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

	// ----
	// Filters open state
	const [isRegionFilterOpen, setIsRegionFilterOpen] = useState(searchParams.get("regions") ? true : false);
	const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(searchParams.get("departments") ? true : false);
	const [isCityFilterOpen, setIsCityFilterOpen] = useState(searchParams.get("cities") ? true : false);
	const [isPublisherFilterOpen, setIsPublisherFilterOpen] = useState(searchParams.get("publishers") ? true : false);
	const [isPublicationDateFilterOpen, setIsPublicationDateFilterOpen] = useState(
		searchParams.get("publicationDatesStart") || searchParams.get("publicationDatesEnd") ? true : false
	);
	const [isTranslationDateFilterOpen, setIsTranslationDateFilterOpen] = useState(
		searchParams.get("translationDatesStart") || searchParams.get("translationDatesEnd") ? true : false
	);
	const [isReissueDateFilterOpen, setIsReissueDateFilterOpen] = useState(
		searchParams.get("reissueDatesStart") || searchParams.get("reissueDatesEnd") ? true : false
	);
	// ----

	if (isLoading || !data) return <div>{t("SearchBar.loading")}</div>;
	if (error) return <div>{t("SearchBar.error", { error: error })}</div>;

	return (
		<div className="flex flex-wrap items-center gap-3">
			<CommandSearch />
			<div className="flex flex-wrap lg:flex-nowrap items-center justify-between flex-1 gap-6">
				<div className="flex flex-wrap items-center gap-2 lg:min-w-[500px]">
					<ComboboxFilter type="languages" options={data.languages} />
					<ComboboxFilter type="establishementsTypes" options={data.establishementsTypes} />
					<ComboboxFilter type="booksTypes" options={data.booksTypes} />
					{isRegionFilterOpen && <ComboboxFilter type="regions" options={data.regions} />}
					{isDepartmentFilterOpen && <ComboboxFilter type="departments" options={data.departments} />}
					{isCityFilterOpen && <ComboboxFilter type="cities" options={data.cities} />}
					{isPublisherFilterOpen && <ComboboxSearchFilter type="publishers" />}
					{isPublicationDateFilterOpen && <DateRangePicker type="publicationDates" />}
					{isTranslationDateFilterOpen && <DateRangePicker type="translationDates" />}
					{isReissueDateFilterOpen && <DateRangePicker type="reissueDates" />}
				</div>
				<PopoverMoreFilters
					isRegionFilterOpen={isRegionFilterOpen}
					setIsRegionFilterOpen={setIsRegionFilterOpen}
					isDepartmentFilterOpen={isDepartmentFilterOpen}
					setIsDepartmentFilterOpen={setIsDepartmentFilterOpen}
					isCityFilterOpen={isCityFilterOpen}
					setIsCityFilterOpen={setIsCityFilterOpen}
					isPublisherFilterOpen={isPublisherFilterOpen}
					setIsPublisherFilterOpen={setIsPublisherFilterOpen}
					isPublicationDateFilterOpen={isPublicationDateFilterOpen}
					setIsPublicationDateFilterOpen={setIsPublicationDateFilterOpen}
					isTranslationDateFilterOpen={isTranslationDateFilterOpen}
					setIsTranslationDateFilterOpen={setIsTranslationDateFilterOpen}
					isReissueDateFilterOpen={isReissueDateFilterOpen}
					setIsReissueDateFilterOpen={setIsReissueDateFilterOpen}
				/>
			</div>
		</div>
	);
}
