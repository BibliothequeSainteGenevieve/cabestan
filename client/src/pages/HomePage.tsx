import SearchBar from "@/components/SearchBar";
import { useTranslation } from "react-i18next";

export default function Home() {
	const { t } = useTranslation();

	return (
		<div className="py-4">
			<h1 className="pb-2">{t("HomePage.title")}</h1>
			<SearchBar />
		</div>
	);
}
