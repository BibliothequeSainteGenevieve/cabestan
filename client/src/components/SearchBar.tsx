import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CommandSearch } from "./SearchBar/CommandSearch/CommandSearch";
import ComboboxFilter from "./SearchBar/ComboboxFilter";

const getClientConfig = async () => {
	const response = await fetch("http://localhost:8082/api/client-config");
	return response.json();
};

export default function SearchBar() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

	const [searchString, setSearchString] = useState<string | undefined>(searchParams.get("str") || undefined);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>(searchParams.get("languages")?.split(",") || []);
	const [selectedEstablishementsTypes, setSelectedEstablishementsTypes] = useState<string[]>(
		searchParams.get("establishementsTypes")?.split(",") || []
	);
	const [selectedBooksTypes, setSelectedBooksTypes] = useState<string[]>(searchParams.get("booksTypes")?.split(",") || []);

	useEffect(() => {
		if (searchString) {
			searchParams.set("str", searchString);
		} else {
			searchParams.delete("str");
		}

		const filters = [
			{
				label: "languages",
				value: selectedLanguages,
			},
			{
				label: "establishementsTypes",
				value: selectedEstablishementsTypes,
			},
			{
				label: "booksTypes",
				value: selectedBooksTypes,
			},
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
	}, [navigate, searchParams, searchString, selectedLanguages, selectedEstablishementsTypes, selectedBooksTypes]);

	if (isLoading || !data) return <div>{t("SearchBar.loading")}</div>;
	if (error) return <div>{t("SearchBar.error", { error: error })}</div>;

	return (
		<div className="flex flex-wrap items-center gap-3">
			<CommandSearch setSearchString={setSearchString} />
			<div className="flex flex-wrap items-center gap-2">
				<ComboboxFilter
					type="languages"
					placeholder={t("filters.languages.placeholder")}
					options={data.languages}
					value={selectedLanguages}
					setValue={setSelectedLanguages}
				/>
				<ComboboxFilter
					type="establishementsTypes"
					placeholder={t("filters.establishementsTypes.placeholder")}
					options={data.establishementsTypes}
					value={selectedEstablishementsTypes}
					setValue={setSelectedEstablishementsTypes}
				/>
				<ComboboxFilter
					type="booksTypes"
					placeholder={t("filters.booksTypes.placeholder")}
					options={data.booksTypes}
					value={selectedBooksTypes}
					setValue={setSelectedBooksTypes}
				/>
			</div>
		</div>
	);
}
