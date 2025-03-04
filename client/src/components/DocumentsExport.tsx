import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getDocumentsExportCSV } from "@/api";
import { useParams, useSearchParams } from "react-router";

export default function DocumentsExport() {
	const { t } = useTranslation();
	const { rcr } = useParams();
	const [searchParams] = useSearchParams();

	if (!rcr) return null;

	return (
		<div className="flex gap-2 print:hidden">
			<Button
				variant="foreground"
				onClick={() => {
					getDocumentsExportCSV(rcr, searchParams.toString());
				}}>
				<Download className="w-4 h-4" />
				{t("Export.csv")}
			</Button>
		</div>
	);
}
