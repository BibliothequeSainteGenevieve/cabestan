import SearchBar from "@/components/SearchBar";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

export default function Home() {
	const { t } = useTranslation();

	return (
		<div className="p-4 lg:py-4 lg:px-16">
			<Header />
			<div className="py-4">
				<h1 className="pb-2">{t("search.title")}</h1>
				<SearchBar />
			</div>
			<main>Contenu</main>
		</div>
	);
}
