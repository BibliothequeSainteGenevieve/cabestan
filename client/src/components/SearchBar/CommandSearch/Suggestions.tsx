import { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Book, Landmark, User } from "lucide-react";
import { useTranslation } from "react-i18next";

type Suggestion = {
	title: string;
	subtitle: string;
	type: SuggestionType;
};

enum SuggestionType {
	LIBRARY = "rcr",
	DOCUMENT = "document",
	AUTHOR = "author",
	ILLUSTRATOR = "illustrator",
	TRANSLATOR = "translator",
}

interface SuggestionsProps {
	suggestions: Suggestion[];
	isLoading: boolean;
	error: any;
	setInputValue: (value: string) => void;
	setSearchString: (value: string) => void;
	setIsOpen: (value: boolean) => void;
}

function Suggestions({ suggestions, isLoading, error, setInputValue, setSearchString, setIsOpen }: SuggestionsProps) {
	const { t } = useTranslation();

	const suggestionsSections = [
		{
			icon: <Landmark className="w-4 h-4" />,
			type: SuggestionType.LIBRARY,
		},
		{
			icon: <Book className="w-4 h-4" />,
			type: SuggestionType.DOCUMENT,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: SuggestionType.AUTHOR,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: SuggestionType.ILLUSTRATOR,
		},
		{
			icon: <User className="w-4 h-4" />,
			type: SuggestionType.TRANSLATOR,
		},
	];

	const handleSelect = ({ searchString, inputValue }: { searchString: string; inputValue: string }) => {
		setInputValue(inputValue);
		setSearchString(searchString);
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
			{/* 			<CommandGroup
				heading={
					<span className="flex items-center gap-1 font-bold">
						<Landmark className="w-4 h-4" /> {t("CommandSearch.suggestions.libraries")}
					</span>
				}>
				{suggestions
					?.filter((suggestion: any) => suggestion.type === SuggestionType.LIBRARY)
					.map((rcr: any) => (
						<CommandItem
							key={rcr.rcr}
							value={rcr.rcr}
							onSelect={() => handleSelect({ searchString: rcr.rcr, inputValue: `${rcr.name} - ${rcr.rcr}` })}>
							<span>
								{rcr.name} - {rcr.rcr}
							</span>
						</CommandItem>
					))}
			</CommandGroup> */}
		</CommandList>
	);
}

export default Suggestions;
