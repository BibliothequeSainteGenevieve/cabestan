import { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useSetFilterSearchParams } from "@/hooks/useSetFilterSearchParams";
import { FilterTypes } from "@/models/Filters";

export default function SwitchNullValues() {
	const { t } = useTranslation();
	const setFilterSearchParams = useSetFilterSearchParams();
	const [searchParams] = useSearchParams();
	const [nullValues, setNullValues] = useState(
		searchParams.get(FilterTypes.NULL_VALUES) ? searchParams.get(FilterTypes.NULL_VALUES) === "true" : true
	);

	const handleChange = (value: boolean) => {
		setNullValues(value);
		setFilterSearchParams([value.toString()], FilterTypes.NULL_VALUES);
	};

	return (
		<div className="flex items-center space-x-2 mt-2">
			<Switch id="include-null-values" checked={nullValues} onCheckedChange={handleChange} />
			<Label htmlFor="include-null-values" className="text-sm">
				{t("SearchBar.includeUnknown")}
			</Label>
		</div>
	);
}
