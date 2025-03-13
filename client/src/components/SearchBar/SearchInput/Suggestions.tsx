import { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { GlobalSuggestion, GlobalSuggestionType } from "@/models/Suggestions";
import { Book, Landmark, User } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Fragment } from "react/jsx-runtime";

interface SuggestionsProps {
	suggestions: GlobalSuggestion[];
	isLoading: boolean;
	error: any;
	setInputValue: (value: string) => void;
	setIsOpen: (value: boolean) => void;
	isBookSearch?: boolean;
}

function Suggestions({ suggestions, isLoading, error, setInputValue, setIsOpen, isBookSearch }: SuggestionsProps) {
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();
	useClickOutside(ref as React.RefObject<HTMLElement>, () => setIsOpen(false));

	const suggestionsSections = [
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

	if (!isBookSearch) {
		suggestionsSections.unshift({
			icon: <Landmark className="w-4 h-4" />,
			type: GlobalSuggestionType.LIBRARY,
		});
	}

	const handleSelect = ({
		searchString,
		searchType,
		subTitle,
	}: {
		searchString: string;
		searchType: GlobalSuggestionType;
		subTitle: string;
	}) => {
		setInputValue(`${searchString} - ${subTitle}`);
		setFilterSearchParams([searchString], "string");
		setFilterSearchParams([searchType], "type");
		if (subTitle) {
			setFilterSearchParams([subTitle], "subtitle");
		}
		setIsOpen(false);
	};

	if (isLoading) return <span className="p-5 text-sm text-center italic">{t("CommandSearch.suggestions.loading")}</span>;
	if (error) return <span className="p-4 text-red-500">{t("CommandSearch.suggestions.error", { error: error.message })}</span>;

	return (
		<CommandList ref={ref} className="absolute bg-white top-10 w-full z-50 shadow-md">
			<CommandEmpty>
				<span>{t("CommandSearch.suggestions.empty")}</span>
			</CommandEmpty>
			{suggestions?.length > 0 &&
				suggestionsSections.map((section) => (
					<Fragment key={section.type}>
						<CommandGroup
							heading={
								<span className="flex items-center gap-1 font-bold">
									{section.icon} {t(`CommandSearch.suggestions.types.${section.type}`)}
								</span>
							}>
							{suggestions
								.filter((suggestion) => suggestion.type === section.type)
								.map((suggestion, index) => (
									<CommandItem
										key={suggestion.subtitle + index}
										value={suggestion.title}
										onSelect={() =>
											handleSelect({
												searchString: suggestion.title,
												searchType: section.type,
												subTitle: suggestion.subtitle,
											})
										}>
										<span className="capitalize">
											{suggestion.title} {suggestion.subtitle ? `- ${suggestion?.subtitle}` : ""}
										</span>
									</CommandItem>
								))}
						</CommandGroup>
						<CommandSeparator />
					</Fragment>
				))}
		</CommandList>
	);
}

export default Suggestions;
