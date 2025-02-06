import { useTranslation } from "react-i18next";
import logo from "../assets/logo-bsg.png";

export default function Header() {
	const { t } = useTranslation();

	return (
		<header className="flex items-center gap-3 pb-4 border-b border-border">
			<img src={logo} alt="Cabestan" width={50} height={50} />
			<div className="flex flex-col gap-1">
				<p className="text-2xl">{t("header.title")}</p>
				<p className="text-sm text-secondary">{t("header.subtitle")}</p>
			</div>
		</header>
	);
}
