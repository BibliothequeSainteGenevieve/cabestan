import { Command } from "@/components/ui/command";
import { Input } from "../../ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import Suggestions from "./Suggestions";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { getGlobalSuggestions } from "@/api";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { useSearchParams } from "react-router";

interface CommandSearchProps {
	isBookSearch?: boolean;
}

export function CommandSearch({ isBookSearch }: CommandSearchProps) {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const setFilterSearchParams = useSetFilterSearchParams();

	const [searchSuggestionsValue, setSearchSuggestionsValue] = useState<string>("");
	const [inputValue, setInputValue] = useState<string>(
		searchParams.get("string") ? `${searchParams.get("string")} - ${searchParams.get("subtitle")}` : ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const {
		data: suggestions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["suggestions", searchSuggestionsValue],
		queryFn: () => getGlobalSuggestions(searchSuggestionsValue),
	});

	const setSearchSuggestionsValueDebounced = useDebounce(setSearchSuggestionsValue, 300);

	const handleChange = (value: string) => {
		setInputValue(value);

		if (value.length > 2) {
			setIsOpen(true);
			setSearchSuggestionsValueDebounced(value);
		} else {
			setIsOpen(false);
			setFilterSearchParams([], "string");
			setFilterSearchParams([], "subtitle");
			setFilterSearchParams([], "type");
		}
	};

	return (
		<Command className="bg-white rounded-lg relative overflow-visible lg:w-[20rem]">
			<div className="flex items-center gap-1 py-1 px-2">
				<Search className="w-5 h-5" />
				<Input
					placeholder={isBookSearch ? t("CommandSearch.placeholderBook") : t("CommandSearch.placeholder")}
					value={inputValue}
					onChange={(event) => handleChange(event.target.value)}
					className={`border-none shadow-none ${inputValue ? "capitalize" : ""}`}
				/>
			</div>
			{isOpen && (
				<Suggestions
					isBookSearch={isBookSearch}
					isLoading={isLoading}
					error={error}
					suggestions={suggestions || []}
					setInputValue={setInputValue}
					setIsOpen={setIsOpen}
				/>
			)}
		</Command>
	);
}
