import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { useTranslation } from "react-i18next";

interface ComboboxSearchFilterProps {
	suggestions: { slug: string; label: string }[];
	value: string[];
	setValue: (value: string[]) => void;
	setOpen: (value: boolean) => void;
	isLoading: boolean;
	error: any;
}

export default function PublishersSuggestions({
	suggestions,
	value,
	setValue,
	setOpen,
	isLoading,
	error,
}: ComboboxSearchFilterProps) {
	const { t } = useTranslation();

	if (isLoading) return <span>{t("CommandSearch.suggestions.loading")}</span>;
	if (error) return <span>{t("CommandSearch.suggestions.error", { error: error.message })}</span>;

	return (
		<CommandList>
			<CommandEmpty>{t("ComboboxFilter.empty")}</CommandEmpty>
			{value.length > 0 && (
				<CommandItem
					className="uppercase bg-background"
					onSelect={() => {
						setValue([]);
						setOpen(false);
					}}>
					{t("ComboboxFilter.reset")}
					<X className={cn("ml-auto", "opacity-100")} />
				</CommandItem>
			)}
			{suggestions?.map((suggestion: { slug: string; label: string }) => (
				<>
					<CommandItem
						key={suggestion.slug}
						onSelect={() => {
							if (value.includes(suggestion.slug)) {
								setValue(value.filter((item) => item !== suggestion.slug));
							} else {
								setValue([...value, suggestion.slug]);
							}
						}}>
						{suggestion.label}
						<Check className={cn("ml-auto", value.includes(suggestion.slug) ? "opacity-100" : "opacity-0")} />
					</CommandItem>
				</>
			))}
		</CommandList>
	);
}
