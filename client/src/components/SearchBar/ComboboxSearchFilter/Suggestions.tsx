import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";

type ComboboxSearchOption = {
	slug: string;
	label: string;
};
interface ComboboxSearchFilterProps {
	suggestions: ComboboxSearchOption[];
	value: string[];
	setValue: (value: string[]) => void;
	setOpen: (value: boolean) => void;
	isLoading: boolean;
	error: any;
	type: string;
}

export default function Suggestions({
	suggestions,
	value,
	setValue,
	setOpen,
	isLoading,
	error,
	type,
}: ComboboxSearchFilterProps) {
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

	if (isLoading) return <span className="p-4">{t("CommandSearch.suggestions.loading")}</span>;
	if (error) return <span className="p-4 text-red-500">{t("CommandSearch.suggestions.error")}</span>;

	return (
		<CommandList>
			<CommandEmpty>{t("ComboboxFilter.empty")}</CommandEmpty>
			{value.length > 0 && (
				<CommandItem
					className="uppercase bg-background"
					onSelect={() => {
						setValue([]);
						setOpen(false);
						setFilterSearchParams([], type);
					}}>
					{t("ComboboxFilter.reset")}
					<X className={cn("ml-auto", "opacity-100")} />
				</CommandItem>
			)}
			{suggestions?.map((suggestion: ComboboxSearchOption) => (
				<CommandItem
					key={suggestion.slug}
					onSelect={() => {
						let newValues: string[] = [];
						if (value.includes(suggestion.slug)) {
							newValues = value.filter((item) => item !== suggestion.slug);
						} else {
							newValues = [...value, suggestion.slug];
						}
						setValue(newValues);
						setFilterSearchParams(newValues, type);
					}}>
					{suggestion.label}
					<Check className={cn("ml-auto", value.includes(suggestion.slug) ? "opacity-100" : "opacity-0")} />
				</CommandItem>
			))}
		</CommandList>
	);
}
