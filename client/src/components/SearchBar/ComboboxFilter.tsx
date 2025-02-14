import { X, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";

interface ComboboxFilterProps {
	options: { slug: string }[];
	type: string;
	value: string[];
	setValue: (value: string[]) => void;
}

export default function ComboboxFilter({ options, type, value, setValue }: ComboboxFilterProps) {
	const [open, setOpen] = useState(false);
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
						? value.map((item) => t(`filters.${type}.options.${item}`)).join(", ")
						: t(`filters.${type}.placeholder`)}
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
