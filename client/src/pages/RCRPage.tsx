import RCRDetails from "@/components/RCRDetails";
import BookSearchBar from "@/components/SearchBar/BookSearchBar";
// import { useTranslation } from "react-i18next";

export default function BooksPage() {
	// const { t } = useTranslation();

	return (
		<div className="py-4 flex flex-col bg-background">
			<RCRDetails />
			<div className="py-6">
				<BookSearchBar />
			</div>
		</div>
	);
}
