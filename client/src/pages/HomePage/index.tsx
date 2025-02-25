import SearchBar from "@/components/SearchBar";
import { useTranslation } from "react-i18next";
import Results from "@/pages/HomePage/Results";

export default function Home() {
	const { t } = useTranslation();

	return (
		<div className="py-4 flex flex-col bg-background">
			<div>
				<h1 className="pb-2">{t("HomePage.title")}</h1>
				<SearchBar />
			</div>
			<Results />
		</div>
	);
}
