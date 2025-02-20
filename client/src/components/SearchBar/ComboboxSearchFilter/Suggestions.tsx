import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";

type ComboboxSearchOption = {
	id: string;
	name: string;
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
			<CommandGroup>
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
				{suggestions?.length > 0 &&
					suggestions.map((suggestion: ComboboxSearchOption) => (
						<CommandItem
							key={suggestion.id}
							onSelect={() => {
								let newValues: string[] = [];
								if (value.includes(suggestion.id)) {
									newValues = value.filter((item) => item !== suggestion.id);
								} else {
									newValues = [...value, suggestion.id];
								}
								setValue(newValues);
								setFilterSearchParams(newValues, type);
							}}>
							{suggestion.name}
							<Check className={cn("ml-auto", value.includes(suggestion.id) ? "opacity-100" : "opacity-0")} />
						</CommandItem>
					))}
			</CommandGroup>
		</CommandList>
	);
}
