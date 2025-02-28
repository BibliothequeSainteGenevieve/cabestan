import { useTranslation } from "react-i18next";
import logo from "../assets/logo-bsg.png";
import { Link, useLocation } from "react-router";
import { routes } from "@/pages/routes";

export default function Header() {
	const { t } = useTranslation();
	const location = useLocation();

	return (
		<header className="pb-4 border-b border-border">
			{location.pathname !== routes.home.path && (
				<Link to={routes.home.path} className="flex items-center gap-3">
					<img src={logo} alt="Cabestan" width={50} height={50} />
					<div className="flex flex-col gap-1">
						<p className="text-2xl">{t("Header.title")}</p>
						<p className="text-sm text-grey">{t("Header.subtitle")}</p>
					</div>
				</Link>
			)}
			{location.pathname === routes.home.path && (
				<div className="flex items-center gap-3">
					<img src={logo} alt="Cabestan" width={50} height={50} />
					<div className="flex flex-col gap-1">
						<p className="text-2xl">{t("Header.title")}</p>
						<p className="text-sm text-grey">{t("Header.subtitle")}</p>
					</div>
				</div>
			)}
		</header>
	);
}
