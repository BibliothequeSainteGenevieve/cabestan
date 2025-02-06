import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Combobox from "./shadcn/Combobox";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const getClientConfig = async () => {
	const response = await fetch("http://localhost:8082/api/client-config");
	return response.json();
};

export default function SearchBar() {
	const { t } = useTranslation();
	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });

	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [selectedEstablishementsTypes, setSelectedEstablishementsTypes] = useState<string[]>([]);
	const [selectedBooksTypes, setSelectedBooksTypes] = useState<string[]>([]);

	if (isLoading || !data) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex items-center gap-1 bg-white rounded-md px-4 py-1 w-72">
				<SearchIcon />
				<Input type="text" placeholder={t("search.placeholder")} className="border-none shadow-none" />
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Combobox
					type="languages"
					placeholder={t("search.languages.placeholder")}
					options={data.languages}
					value={selectedLanguages}
					setValue={setSelectedLanguages}
				/>
				<Combobox
					type="establishementsTypes"
					placeholder={t("search.establishementsTypes.placeholder")}
					options={data.establishementsTypes}
					value={selectedEstablishementsTypes}
					setValue={setSelectedEstablishementsTypes}
				/>
				<Combobox
					type="booksTypes"
					placeholder={t("search.booksTypes.placeholder")}
					options={data.booksTypes}
					value={selectedBooksTypes}
					setValue={setSelectedBooksTypes}
				/>
			</div>
		</div>
	);
}
