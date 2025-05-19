import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { Document } from "@/models/Document";
import { useTranslation } from "react-i18next";

type BooksListLineProps = {
	document: Document;
};

export function BooksListLine({ document }: BooksListLineProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	return (
		<>
			<TableRow className="cursor-pointer bg-white" onClick={() => setIsOpen(!isOpen)}>
				<TableCell className="capitalize rounded-s-lg font-medium">
					{document.title || t("DocumentsList.unknown")}
				</TableCell>
				<TableCell className="capitalize">
					{document.author ? document.author?.firstname + " " + document.author?.lastname : t("DocumentsList.unknown")}
				</TableCell>
				<TableCell className="capitalize">{document.publisher || t("DocumentsList.unknown")}</TableCell>
				<TableCell className="capitalize">
					{document.publication_date
						? new Date(document.publication_date).toLocaleDateString()
						: t("DocumentsList.unknown")}
				</TableCell>
				<TableCell>
					{document.original_language
						? t(`filters.languages.options.${document.original_language}`)
						: t("DocumentsList.unknown")}
				</TableCell>
				<TableCell>
					{document.type ? t(`filters.documentsTypes.options.${document.type}`) : t("DocumentsList.unknown")}
				</TableCell>
				<TableCell className="rounded-e-lg">
					{isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
				</TableCell>
			</TableRow>
			<TableRow className={`${isOpen ? "table-row" : "hidden"} bg-white`}>
				<TableCell colSpan={7} className="relative top-[-1rem]">
					<div className="p-4 border-1 border-border-light rounded-md flex gap-20">
						<p>
							<span className="uppercase text-grey text-xs">{t("DocumentsList.translator")} :</span>
							<br />
							{document.translator
								? document.translator?.firstname + " " + document.translator?.lastname
								: t("DocumentsList.unknown")}
						</p>
						<p>
							<span className="uppercase text-grey text-xs">{t("DocumentsList.publicationPlace")} :</span>
							<br />
							{document.publication_place ? document.publication_place : t("DocumentsList.unknown")}
						</p>
						{document.tags && (
							<p>
								<span className="uppercase text-grey text-xs">{t("DocumentsList.tags")} :</span>
							</p>
						)}
					</div>
				</TableCell>
			</TableRow>
		</>
	);
}
