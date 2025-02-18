import { useTranslation } from "react-i18next";

type ResultsCountProps = {
	totalItems: number;
};

export default function ResultsCount({ totalItems }: ResultsCountProps) {
	const { t } = useTranslation();

	return (
		<p>
			<span className="font-bold">{totalItems}</span> {t("RCRList.results")}
		</p>
	);
}
