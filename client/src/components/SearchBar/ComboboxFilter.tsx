import { X, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { useSearchParams } from "react-router";
import { FilterTypes } from "@/models/Filters";

interface ComboboxFilterProps {
	options: { slug: string }[];
	type: string;
}

export default function ComboboxFilter({ options, type }: ComboboxFilterProps) {
	const [searchParams] = useSearchParams();
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState<string[]>(searchParams.get(type)?.split(",") || []);
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();

	if (!options) return null;

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
					{value.length > 0
						? value
								.map((item) =>
									type === FilterTypes.LANGUAGES
										? t(`filters.${type}.options.${item}`) + " (" + item + ")"
										: t(`filters.${type}.options.${item}`)
								)
								.join(", ")
						: t(`filters.${type}.placeholder`)}{" "}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0 bg-white">
				<Command>
					<CommandInput placeholder={t("ComboboxFilter.searchPlaceholder")} />
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
							{options.map((option) => (
								<CommandItem
									key={option.slug}
									value={option.slug}
									onSelect={(currentValue) => {
										let newValues = [];
										if (value.includes(currentValue)) {
											newValues = value.filter((item) => item !== currentValue);
										} else {
											newValues = [...value, currentValue];
										}
										setValue(newValues);
										setFilterSearchParams(newValues, type);
									}}>
									{t(`filters.${type}.options.${option.slug}`)}
									{type === FilterTypes.LANGUAGES && " (" + option.slug + ")"}
									<Check className={cn("ml-auto", value.includes(option.slug) ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
