import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Combobox from "./shadcn/Combobox";
import { useQuery } from "@tanstack/react-query";

const getClientConfig = async () => {
	const response = await fetch("http://localhost:8082/api/client-config");
	return response.json();
};

export default function SearchBar() {
	const { t } = useTranslation();

	const { data, isLoading, error } = useQuery({ queryKey: ["clientConfig"], queryFn: getClientConfig });

	if (isLoading || !data) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex items-center gap-1 bg-white rounded-md px-4 py-1 w-72">
				<SearchIcon />
				<Input type="text" placeholder={t("search.placeholder")} className="border-none shadow-none" />
			</div>
			{data && (
				<div className="flex flex-wrap items-center gap-2">
					<Combobox options={data?.languages} type="languages" placeholder={t("search.languages.placeholder")} />
					<Combobox
						options={data?.establishementsTypes}
						type="establishementsTypes"
						placeholder={t("search.establishementsTypes.placeholder")}
					/>
					<Combobox options={data?.booksTypes} type="booksTypes" placeholder={t("search.booksTypes.placeholder")} />
				</div>
			)}
		</div>
	);
}
