import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface ComboboxProps {
	options: string[];
	type: string;
	placeholder: string;
}

export default function Combobox({ options, placeholder, type }: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");
	const { t } = useTranslation();

	console.log({ options });

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					role="combobox"
					aria-expanded={open}
					className={cn("bg-white hover:bg-white w-auto p-4 justify-between", value ? "bg-lightRed" : "")}>
					{value ? t(`filters.${type}.options.${options.find((option) => option === value)}`) : placeholder}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0 bg-white">
				<Command>
					<CommandInput placeholder={t("search.title")} />
					<CommandList>
						<CommandEmpty>{t("search.combobox.empty")}</CommandEmpty>
						<CommandGroup>
							{value && (
								<CommandItem
									className="uppercase bg-background"
									onSelect={() => {
										setValue("");
										setOpen(false);
									}}>
									{t("search.combobox.reset")}
									<X className={cn("ml-auto", "opacity-100")} />
								</CommandItem>
							)}
							{options.map((option) => (
								<CommandItem
									key={option}
									value={option}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}>
									{t(`filters.${type}.options.${option}`)}
									<Check className={cn("ml-auto", value === option ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
