import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CommandSearch } from "./SearchInput/SearchInput";
import ComboboxFilter from "./ComboboxFilter";
import PopoverMoreFilters from "./PopoverMoreFilters";
import DateRangePicker from "./DateRangePicker/DateRangePicker";
import { getClientConfig } from "@/api";
import ComboboxSearchFilter from "./PublishersFilter/PublishersFilter";

export default function SearchBar() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

	// Base filters values
	const [searchString, setSearchString] = useState<string | undefined>(searchParams.get("str") || undefined);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>(searchParams.get("languages")?.split(",") || []);
	const [selectedEstablishementsTypes, setSelectedEstablishementsTypes] = useState<string[]>(
		searchParams.get("establishementsTypes")?.split(",") || []
	);
	const [selectedBooksTypes, setSelectedBooksTypes] = useState<string[]>(searchParams.get("booksTypes")?.split(",") || []);

	// More filters open state
	const [isRegionFilterOpen, setIsRegionFilterOpen] = useState(searchParams.get("regions") ? true : false);
	const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(searchParams.get("departments") ? true : false);
	const [isCityFilterOpen, setIsCityFilterOpen] = useState(searchParams.get("cities") ? true : false);
	const [isPublisherFilterOpen, setIsPublisherFilterOpen] = useState(searchParams.get("publishers") ? true : false);
	const [isPublicationDateFilterOpen, setIsPublicationDateFilterOpen] = useState(
		searchParams.get("startPublicationDate") || searchParams.get("endPublicationDate") ? true : false
	);
	const [isTranslationDateFilterOpen, setIsTranslationDateFilterOpen] = useState(
		searchParams.get("startTranslationDate") || searchParams.get("endTranslationDate") ? true : false
	);
	const [isReissueDateFilterOpen, setIsReissueDateFilterOpen] = useState(
		searchParams.get("startReissueDate") || searchParams.get("endReissueDate") ? true : false
	);

	// More filters values
	const [selectedRegions, setSelectedRegions] = useState<string[]>(searchParams.get("regions")?.split(",") || []);
	const [selectedDepartments, setSelectedDepartments] = useState<string[]>(searchParams.get("departments")?.split(",") || []);
	const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get("cities")?.split(",") || []);
	const [selectedPublishers, setSelectedPublishers] = useState<string[]>(searchParams.get("publishers")?.split(",") || []);
	const [selectedStartPublicationDate, setSelectedStartPublicationDate] = useState<Date | undefined>(
		searchParams.get("startPublicationDate") ? new Date(Number(searchParams.get("startPublicationDate")!)) : undefined
	);
	const [selectedEndPublicationDate, setSelectedEndPublicationDate] = useState<Date | undefined>(
		searchParams.get("endPublicationDate") ? new Date(Number(searchParams.get("endPublicationDate")!)) : undefined
	);
	const [selectedStartTranslationDate, setSelectedStartTranslationDate] = useState<Date | undefined>(
		searchParams.get("startTranslationDate") ? new Date(Number(searchParams.get("startTranslationDate")!)) : undefined
	);
	const [selectedEndTranslationDate, setSelectedEndTranslationDate] = useState<Date | undefined>(
		searchParams.get("endTranslationDate") ? new Date(Number(searchParams.get("endTranslationDate")!)) : undefined
	);
	const [selectedStartReissueDate, setSelectedStartReissueDate] = useState<Date | undefined>(
		searchParams.get("startReissueDate") ? new Date(Number(searchParams.get("startReissueDate")!)) : undefined
	);
	const [selectedEndReissueDate, setSelectedEndReissueDate] = useState<Date | undefined>(
		searchParams.get("endReissueDate") ? new Date(Number(searchParams.get("endReissueDate")!)) : undefined
	);

	// Effect to update the search params when the filters values change
	useEffect(() => {
		const dateFilters = [
			{ label: "startPublicationDate", value: selectedStartPublicationDate },
			{ label: "endPublicationDate", value: selectedEndPublicationDate },
			{ label: "startTranslationDate", value: selectedStartTranslationDate },
			{ label: "endTranslationDate", value: selectedEndTranslationDate },
			{ label: "startReissueDate", value: selectedStartReissueDate },
			{ label: "endReissueDate", value: selectedEndReissueDate },
		];

		dateFilters.forEach((filter) => {
			if (filter.value) {
				searchParams.set(filter.label, filter.value.getTime().toString());
			} else {
				searchParams.delete(filter.label);
			}
		});

		const otherFilters = [
			{ label: "str", value: [searchString] },
			{ label: "languages", value: selectedLanguages },
			{ label: "establishementsTypes", value: selectedEstablishementsTypes },
			{ label: "booksTypes", value: selectedBooksTypes },
			{ label: "regions", value: selectedRegions },
			{ label: "departments", value: selectedDepartments },
			{ label: "cities", value: selectedCities },
			{ label: "publishers", value: selectedPublishers },
			{ label: "booksTypes", value: selectedBooksTypes },
		];

		otherFilters.forEach((filter) => {
			if (filter.value.length > 0 && filter.value[0] !== undefined) {
				searchParams.set(filter.label, filter.value.join(","));
			} else {
				searchParams.delete(filter.label);
			}
		});

		navigate({
			pathname: "/search",
			search: searchParams.toString(),
		});
	}, [
		navigate,
		searchParams,
		searchString,
		selectedLanguages,
		selectedEstablishementsTypes,
		selectedBooksTypes,
		selectedRegions,
		selectedDepartments,
		selectedCities,
		selectedPublishers,
		selectedStartPublicationDate,
		selectedEndPublicationDate,
		selectedStartTranslationDate,
		selectedEndTranslationDate,
		selectedStartReissueDate,
		selectedEndReissueDate,
	]);

	if (isLoading || !data) return <div>{t("SearchBar.loading")}</div>;
	if (error) return <div>{t("SearchBar.error", { error: error })}</div>;

	return (
		<div className="flex flex-wrap items-center gap-3">
			<CommandSearch setSearchString={setSearchString} />
			<div className="flex flex-wrap lg:flex-nowrap items-center justify-between flex-1 gap-6">
				<div className="flex flex-wrap items-center gap-2 lg:min-w-[500px]">
					<ComboboxFilter
						type="languages"
						options={data.languages}
						value={selectedLanguages}
						setValue={setSelectedLanguages}
					/>
					<ComboboxFilter
						type="establishementsTypes"
						options={data.establishementsTypes}
						value={selectedEstablishementsTypes}
						setValue={setSelectedEstablishementsTypes}
					/>
					<ComboboxFilter
						type="booksTypes"
						options={data.booksTypes}
						value={selectedBooksTypes}
						setValue={setSelectedBooksTypes}
					/>
					{isRegionFilterOpen && (
						<ComboboxFilter
							type="regions"
							options={data.regions}
							value={selectedRegions}
							setValue={setSelectedRegions}
						/>
					)}
					{isDepartmentFilterOpen && (
						<ComboboxFilter
							type="departments"
							options={data.departments}
							value={selectedDepartments}
							setValue={setSelectedDepartments}
						/>
					)}
					{isCityFilterOpen && (
						<ComboboxFilter type="cities" options={data.cities} value={selectedCities} setValue={setSelectedCities} />
					)}
					{isPublisherFilterOpen && (
						<ComboboxSearchFilter
							type="publishers"
							options={data.publishers}
							value={selectedPublishers}
							setValue={setSelectedPublishers}
						/>
					)}
					{isPublicationDateFilterOpen && (
						<DateRangePicker
							label={t("filters.publicationDates.label")}
							selectedStartPublicationDate={selectedStartPublicationDate}
							selectedEndPublicationDate={selectedEndPublicationDate}
							setSelectedStartPublicationDate={setSelectedStartPublicationDate}
							setSelectedEndPublicationDate={setSelectedEndPublicationDate}
						/>
					)}
					{isTranslationDateFilterOpen && (
						<DateRangePicker
							label={t("filters.translationDates.label")}
							selectedStartPublicationDate={selectedStartTranslationDate}
							selectedEndPublicationDate={selectedEndTranslationDate}
							setSelectedStartPublicationDate={setSelectedStartTranslationDate}
							setSelectedEndPublicationDate={setSelectedEndTranslationDate}
						/>
					)}
					{isReissueDateFilterOpen && (
						<DateRangePicker
							label={t("filters.reissueDates.label")}
							selectedStartPublicationDate={selectedStartReissueDate}
							selectedEndPublicationDate={selectedEndReissueDate}
							setSelectedStartPublicationDate={setSelectedStartReissueDate}
							setSelectedEndPublicationDate={setSelectedEndReissueDate}
						/>
					)}
				</div>
				<PopoverMoreFilters
					isRegionFilterOpen={isRegionFilterOpen}
					setIsRegionFilterOpen={setIsRegionFilterOpen}
					setSelectedRegions={setSelectedRegions}
					isDepartmentFilterOpen={isDepartmentFilterOpen}
					setIsDepartmentFilterOpen={setIsDepartmentFilterOpen}
					setSelectedDepartments={setSelectedDepartments}
					isCityFilterOpen={isCityFilterOpen}
					setIsCityFilterOpen={setIsCityFilterOpen}
					setSelectedCities={setSelectedCities}
					isPublisherFilterOpen={isPublisherFilterOpen}
					setIsPublisherFilterOpen={setIsPublisherFilterOpen}
					setSelectedPublishers={setSelectedPublishers}
					isPublicationDateFilterOpen={isPublicationDateFilterOpen}
					setIsPublicationDateFilterOpen={setIsPublicationDateFilterOpen}
					setSelectedStartPublicationDate={setSelectedStartPublicationDate}
					setSelectedEndPublicationDate={setSelectedEndPublicationDate}
					isTranslationDateFilterOpen={isTranslationDateFilterOpen}
					setIsTranslationDateFilterOpen={setIsTranslationDateFilterOpen}
					setSelectedStartTranslationDate={setSelectedStartTranslationDate}
					setSelectedEndTranslationDate={setSelectedEndTranslationDate}
					isReissueDateFilterOpen={isReissueDateFilterOpen}
					setIsReissueDateFilterOpen={setIsReissueDateFilterOpen}
					setSelectedStartReissueDate={setSelectedStartReissueDate}
					setSelectedEndReissueDate={setSelectedEndReissueDate}
				/>
			</div>
		</div>
	);
}
