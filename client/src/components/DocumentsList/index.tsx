import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BooksListLine } from "./Line";
import { useQuery } from "@tanstack/react-query";
import { getRCRBooksSearch } from "@/api";
import { useParams, useSearchParams } from "react-router";
import { LoadingSpinner } from "../LoadingSpinner";
import { useTranslation } from "react-i18next";

export function DocumentsList() {
	const { rcr } = useParams();
	const [searchParams] = useSearchParams();
	const { t } = useTranslation();

	const {
		data: documents,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["books", rcr, searchParams.toString()],
		queryFn: () => getRCRBooksSearch(rcr, searchParams.toString()),
	});

	if (isLoading) return <LoadingSpinner />;
	if (error) return <div>{error.message}</div>;

	return (
		<Table className="border-separate border-spacing-y-2 border-spacing-x-0">
			<TableHeader>
				<TableRow>
					<TableHead className="w-[20%]">{t("DocumentsList.title")}</TableHead>
					<TableHead>{t("DocumentsList.author")}</TableHead>
					<TableHead className="w-[20%]">{t("DocumentsList.publisher")}</TableHead>
					<TableHead>{t("DocumentsList.publicationDate")}</TableHead>
					<TableHead>{t("DocumentsList.language")}</TableHead>
					<TableHead>{t("DocumentsList.type")}</TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{documents?.items.length === 0 && (
					<TableRow className="bg-white">
						<TableCell colSpan={7} className="text-center rounded-lg">
							{t("DocumentsList.noResults")}
						</TableCell>
					</TableRow>
				)}
				{documents?.items.map((document, index) => (
					<BooksListLine key={document.title + index} document={document} />
				))}
			</TableBody>
		</Table>
	);
}
