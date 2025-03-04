import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { CommandSearch } from "./SearchInput";
import ComboboxFilter from "./ComboboxFilter";
import DateRangePicker from "./DateRangePicker";
import { getClientConfig } from "@/api";
import ComboboxSearchFilter from "./ComboboxSearchFilter";
import { OptionalFilter, FilterTypes } from "@/models/Filters";
import ResetFiltersButton from "./ResetFiltersButton";
import PopoverMoreFilters from "./PopoverMoreFilters";
import { useState } from "react";
import SwitchNullValues from "./SwitchNullValues";
import DocumentsExport from "../DocumentsExport";

export default function RCRSearchBar() {
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });
	const [searchParams] = useSearchParams();

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

	return (
		<div className="flex flex-wrap items-center gap-3">
			<CommandSearch isBookSearch />
			<div className="flex flex-wrap lg:flex-nowrap items-center justify-between flex-1 gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<ComboboxFilter type={FilterTypes.LANGUAGES} options={data.languages} />
					<ComboboxFilter type={FilterTypes.BOOKS_TYPES} options={data.documentsTypes} />
					<ComboboxSearchFilter type={FilterTypes.PUBLISHERS} />
					{isPublicationDateFilterOpen && <DateRangePicker type={FilterTypes.PUBLICATION_DATES} />}
					{/* {isTranslationDateFilterOpen && <DateRangePicker type={FilterTypes.TRANSLATION_DATES} />} */}
					{isReissueDateFilterOpen && <DateRangePicker type={FilterTypes.REISSUE_DATES} />}
					{searchParams.size > 0 && <ResetFiltersButton />}
				</div>
				<div className="flex items-center gap-2">
					<PopoverMoreFilters filters={optionalFilters} />
					<DocumentsExport />
				</div>
			</div>
			<SwitchNullValues />
		</div>
	);
}
