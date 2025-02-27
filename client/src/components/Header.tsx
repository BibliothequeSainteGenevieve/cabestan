import { useTranslation } from "react-i18next";
import logo from "../assets/logo-bsg.png";
import { Link } from "react-router";

export default function Header() {
	const { t } = useTranslation();

	return (
		<header className="pb-4 border-b border-border">
			<Link to="/" className="flex items-center gap-3">
				<img src={logo} alt="Cabestan" width={50} height={50} />
				<div className="flex flex-col gap-1">
					<p className="text-2xl">{t("Header.title")}</p>
					<p className="text-sm text-grey">{t("Header.subtitle")}</p>
				</div>
			</Link>
		</header>
	);
}
