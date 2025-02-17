import { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { GlobalSuggestion, GlobalSuggestionType } from "@/models/Suggestions";
import { Book, Landmark, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SuggestionsProps {
	suggestions: GlobalSuggestion[];
	isLoading: boolean;
	error: any;
	setInputValue: (value: string) => void;
	setIsOpen: (value: boolean) => void;
}

function Suggestions({ suggestions, isLoading, error, setInputValue, setIsOpen }: SuggestionsProps) {
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

	const suggestionsSections = [
		{
			icon: <Landmark className="w-4 h-4" />,
			type: GlobalSuggestionType.LIBRARY,
		},
		{
			icon: <Book className="w-4 h-4" />,
			type: GlobalSuggestionType.DOCUMENT,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: GlobalSuggestionType.AUTHOR,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: GlobalSuggestionType.ILLUSTRATOR,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: GlobalSuggestionType.TRANSLATOR,
		},
	];

	const handleSelect = ({ searchString, inputValue }: { searchString: string; inputValue: string }) => {
		setInputValue(inputValue);
		setFilterSearchParams([searchString], "str");
		setIsOpen(false);
	};

	if (isLoading || suggestions.length === 0) return <span>{t("CommandSearch.suggestions.loading")}</span>;
	if (error) return <span>{t("CommandSearch.suggestions.error", { error: error.message })}</span>;

	return (
		<CommandList className="absolute bg-white top-11 w-full z-50">
			<CommandEmpty>{t("CommandSearch.suggestions.empty")}</CommandEmpty>
			{suggestionsSections.map((section) => (
				<>
					<CommandGroup
						key={section.type}
						heading={
							<span className="flex items-center gap-1 font-bold">
								{section.icon} {t(`CommandSearch.suggestions.types.${section.type}`)}
							</span>
						}>
						{suggestions
							.filter((suggestion) => suggestion.type === section.type)
							.map((suggestion) => (
								<CommandItem
									key={suggestion.title}
									value={suggestion.title}
									onSelect={() =>
										handleSelect({ searchString: suggestion.title, inputValue: suggestion.title })
									}>
									<span>
										{suggestion.title} {suggestion.subtitle ? `- ${suggestion?.subtitle}` : ""}
									</span>
								</CommandItem>
							))}
					</CommandGroup>
					<CommandSeparator />
				</>
			))}
		</CommandList>
	);
}

export default Suggestions;
