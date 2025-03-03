import { useTranslation } from "react-i18next";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { BookOpen, ChevronRight } from "lucide-react";
import { RCR } from "@/models/RCR";
import { Link, useSearchParams } from "react-router";
import { routes } from "@/pages/routes";

type RCRListProps = {
	items: RCR[];
};

export default function RCRList({ items }: RCRListProps) {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	searchParams.delete("page");
	searchParams.delete("itemsPerPage");

	return (
		<div className="flex flex-col gap-4">
			{items.map((rcr: RCR) => (
				<Link
					key={rcr.rcr}
					to={{
						pathname: routes.rcr.path.replace(":rcr", rcr.rcr),
						search: searchParams.toString(),
					}}>
					<Card className="bg-white shadow-none border-none flex flex-row justify-between items-center gap-0 cursor-pointer">
						<div>
							<CardHeader className="pb-3">
								<CardTitle>{rcr.name}</CardTitle>
								<CardDescription className="text-sm">
									{rcr.contact.address.street}, {rcr.contact.address.postalCode} {rcr.contact.address.city}
								</CardDescription>
							</CardHeader>
							<CardFooter className="flex gap-5 text-primary">
								<p className="text-sm">
									<span className="font-bold">{t("RCRList.rcrCode")}</span> {rcr.rcr}
								</p>
								<p className="flex items-center gap-2 text-sm">
									<BookOpen className="w-4 h-4" />
									{rcr.numberOfDocuments.toLocaleString()}{" "}
									{t("RCRList.books", { count: rcr.numberOfDocuments })}
								</p>
							</CardFooter>
						</div>
						<div className="p-6">
							<ChevronRight className="w-4 h-4" />
						</div>
					</Card>
				</Link>
			))}
		</div>
	);
}
