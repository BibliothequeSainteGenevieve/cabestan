import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { getEditorsSuggestions } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import Suggestions from "./Suggestions";
import { useSearchParams } from "react-router";

interface PublishersFilterProps {
	type: string;
}

export default function PublishersFilter({ type }: PublishersFilterProps) {
	const [searchParams] = useSearchParams();
	const [value, setValue] = useState<string[]>(searchParams.get(type)?.split(",") || []);
	const [open, setOpen] = useState(false);

	const [searchEditorsSuggestionsValue, setSearchEditorsSuggestionsValue] = useState<string>("");
	const { t } = useTranslation();

	const {
		data: suggestions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["publishers-suggestion", searchEditorsSuggestionsValue],
		queryFn: () => getEditorsSuggestions(searchEditorsSuggestionsValue),
	});

	const setSearchEditorsSuggestionsValueDebounced = useDebounce(setSearchEditorsSuggestionsValue, 300);

	const handleInputChange = (value: string) => {
		setSearchEditorsSuggestionsValueDebounced(value);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					role="combobox"
					aria-expanded={open}
					className={cn(
						"bg-white hover:bg-white w-auto p-4 justify-between",
						value.length > 0 ? "bg-lightRed text-primary" : ""
					)}>
					{value.length > 0 ? value.join(", ") : t(`filters.${type}.placeholder`)}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0 bg-white">
				<Command shouldFilter={false}>
					<CommandInput placeholder={t("ComboboxFilter.searchPlaceholder")} onValueChange={handleInputChange} />
					<Suggestions
						isLoading={isLoading}
						error={error}
						suggestions={suggestions}
						value={value}
						setValue={setValue}
						setOpen={setOpen}
						type={type}
					/>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
