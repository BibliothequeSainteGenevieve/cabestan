import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getRCRExportCSV } from "@/api";
import { useSearchParams } from "react-router";

export default function RCRExport() {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();

	return (
		<div className="flex gap-2 print:hidden">
			<Button
				variant="foreground"
				onClick={() => {
					getRCRExportCSV(searchParams.toString());
				}}>
				<Download className="w-4 h-4" />
				{t("Export.csv")}
			</Button>
		</div>
	);
}
