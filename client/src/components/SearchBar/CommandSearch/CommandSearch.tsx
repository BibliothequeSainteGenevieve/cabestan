import { Command } from "@/components/ui/command";
import { Input } from "../../ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import Suggestions from "./Suggestions";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

const getSuggestions = async (value: string | undefined) => {
	if (!value) return [];

	const response = await fetch(`http://localhost:8082/api/rcr/suggestion?str=${value}`);
	return response.json();
};

interface CommandSearchProps {
	setSearchString: (value: string | undefined) => void;
}

export function CommandSearch({ setSearchString }: CommandSearchProps) {
	const { t } = useTranslation();

	const [searchSuggestionsValue, setSearchSuggestionsValue] = useState<string>("");
	const [inputValue, setInputValue] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);

	const {
		data: suggestions,
		isLoading,
		error,
	} = useQuery({ queryKey: ["suggestions", searchSuggestionsValue], queryFn: () => getSuggestions(searchSuggestionsValue) });

	const setSearchSuggestionsValueDebounced = useDebounce(setSearchSuggestionsValue, 300);

	const handleChange = (value: string) => {
		setInputValue(value);

		console.log("inputValue", value);

		if (value.length > 2) {
			setIsOpen(true);
			setSearchSuggestionsValueDebounced(inputValue);
		} else {
			setIsOpen(false);
			setSearchString(undefined);
		}
	};

	return (
		<Command className="bg-white rounded-lg md:w-[450px] relative overflow-visible">
			<div className="flex items-center gap-1 py-1 px-2">
				<Search className="w-5 h-5" />
				<Input
					placeholder={t("CommandSearch.placeholder")}
					value={inputValue}
					onChange={(event) => handleChange(event.target.value)}
					className="border-none shadow-none"
				/>
			</div>
			{isOpen && (
				<Suggestions
					isLoading={isLoading}
					error={error}
					suggestions={suggestions}
					setInputValue={setInputValue}
					setSearchString={setSearchString}
					setIsOpen={setIsOpen}
				/>
			)}
		</Command>
	);
}
