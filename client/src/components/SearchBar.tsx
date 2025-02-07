import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CommandSearch } from "./SearchBar/CommandSearch/CommandSearch";
import ComboboxFilter from "./SearchBar/ComboboxFilter";
import PopoverMoreFilters from "./SearchBar/PopoverMoreFilters";

const getClientConfig = async () => {
	const response = await fetch("http://localhost:8082/api/client-config");
	return response.json();
};

export default function SearchBar() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

	// Base filters
	const [searchString, setSearchString] = useState<string | undefined>(searchParams.get("str") || undefined);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>(searchParams.get("languages")?.split(",") || []);
	const [selectedEstablishementsTypes, setSelectedEstablishementsTypes] = useState<string[]>(
		searchParams.get("establishementsTypes")?.split(",") || []
	);
	const [selectedBooksTypes, setSelectedBooksTypes] = useState<string[]>(searchParams.get("booksTypes")?.split(",") || []);

	// More filters
	const [isRegionFilterOpen, setIsRegionFilterOpen] = useState(searchParams.get("regions") ? true : false);
	const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(searchParams.get("departments") ? true : false);
	const [isCityFilterOpen, setIsCityFilterOpen] = useState(searchParams.get("cities") ? true : false);
	const [isPublisherFilterOpen, setIsPublisherFilterOpen] = useState(searchParams.get("publishers") ? true : false);
	/* 	const [isPublicationDateFilterOpen, setIsPublicationDateFilterOpen] = useState(false);
	const [isTranslationDateFilterOpen, setIsTranslationDateFilterOpen] = useState(false);
	const [isReeditionDateFilterOpen, setIsReeditionDateFilterOpen] = useState(false); */

	const [selectedRegions, setSelectedRegions] = useState<string[]>(searchParams.get("regions")?.split(",") || []);
	const [selectedDepartments, setSelectedDepartments] = useState<string[]>(searchParams.get("departments")?.split(",") || []);
	const [selectedCities, setSelectedCities] = useState<string[]>(searchParams.get("cities")?.split(",") || []);
	const [selectedPublishers, setSelectedPublishers] = useState<string[]>(searchParams.get("publishers")?.split(",") || []);
	/* 	const [selectedPublicationDate, setSelectedPublicationDate] = useState<string | undefined>(
		searchParams.get("publicationDate") || undefined
	);
	const [selectedTranslationDate, setSelectedTranslationDate] = useState<string | undefined>(
		searchParams.get("translationDate") || undefined
	);
	const [selectedReeditionDate, setSelectedReeditionDate] = useState<string | undefined>(
		searchParams.get("reeditionDate") || undefined
	); */

	useEffect(() => {
		if (searchString) {
			searchParams.set("str", searchString);
		} else {
			searchParams.delete("str");
		}

		const filters = [
			{ label: "languages", value: selectedLanguages },
			{ label: "establishementsTypes", value: selectedEstablishementsTypes },
			{ label: "booksTypes", value: selectedBooksTypes },
			{ label: "regions", value: selectedRegions },
			{ label: "departments", value: selectedDepartments },
			{ label: "cities", value: selectedCities },
			{ label: "publishers", value: selectedPublishers },
			{ label: "booksTypes", value: selectedBooksTypes },
		];

		filters.forEach((filter) => {
			if (filter.value.length > 0) {
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
						<ComboboxFilter
							type="publishers"
							options={data.publishers}
							value={selectedPublishers}
							setValue={setSelectedPublishers}
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
				/>
			</div>
		</div>
	);
}
