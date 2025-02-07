import { X, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface ComboboxFilterProps {
	options: string[];
	type: string;
	placeholder: string;
	value: string[];
	setValue: (value: string[]) => void;
}

export default function ComboboxFilter({ options, placeholder, type, value, setValue }: ComboboxFilterProps) {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					role="combobox"
					aria-expanded={open}
					className={cn("bg-white hover:bg-white w-auto p-4 justify-between", value.length > 0 ? "bg-lightRed" : "")}>
					{value.length > 0 ? value.map((item) => t(`filters.${type}.options.${item}`)).join(", ") : placeholder}
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
									}}>
									{t("ComboboxFilter.reset")}
									<X className={cn("ml-auto", "opacity-100")} />
								</CommandItem>
							)}
							{options.map((option) => (
								<CommandItem
									key={option}
									value={option}
									onSelect={(currentValue) => {
										if (value.includes(currentValue)) {
											setValue(value.filter((item) => item !== currentValue));
										} else {
											setValue([...value, currentValue]);
										}
									}}>
									{t(`filters.${type}.options.${option}`)}
									<Check className={cn("ml-auto", value.includes(option) ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
