import { CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Book, Landmark, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SuggestionsProps {
	suggestions: any;
	isLoading: boolean;
	error: any;
	setInputValue: (value: string) => void;
	setSearchString: (value: string) => void;
	setIsOpen: (value: boolean) => void;
}

function Suggestions({ suggestions, isLoading, error, setInputValue, setSearchString, setIsOpen }: SuggestionsProps) {
	const { t } = useTranslation();

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
			<CommandGroup
				heading={
					<span className="flex items-center gap-1 font-bold">
						<Landmark className="w-4 h-4" /> {t("CommandSearch.suggestions.libraries")}
					</span>
				}>
				{suggestions?.rcr?.slice(0, 5).map((rcr: any) => (
					<CommandItem
						key={rcr.rcr}
						value={rcr.rcr}
						onSelect={() => handleSelect({ searchString: rcr.rcr, inputValue: `${rcr.name} - ${rcr.rcr}` })}>
						<span>
							{rcr.name} - {rcr.rcr}
						</span>
					</CommandItem>
				))}
			</CommandGroup>
			<CommandSeparator />
			<CommandGroup
				heading={
					<span className="flex items-center gap-1 font-bold">
						<Book className="w-4 h-4" /> {t("CommandSearch.suggestions.documents")}
					</span>
				}>
				{suggestions?.documents?.slice(0, 5).map((document: any) => (
					<CommandItem
						key={document.title}
						value={document.title}
						onSelect={() => handleSelect({ searchString: document.title, inputValue: document.title })}>
						<span>{document.title}</span>
					</CommandItem>
				))}
			</CommandGroup>
			<CommandSeparator />
			<CommandGroup
				heading={
					<span className="flex items-center gap-1 font-bold">
						<User className="w-4 h-4" /> {t("CommandSearch.suggestions.authors")}
					</span>
				}>
				{suggestions?.authors?.slice(0, 5).map((author: any) => (
					<CommandItem
						key={author.name}
						value={author.name}
						onSelect={() => handleSelect({ searchString: author.name, inputValue: author.name })}>
						<span>{author.name}</span>
					</CommandItem>
				))}
			</CommandGroup>
		</CommandList>
	);
}

export default Suggestions;
