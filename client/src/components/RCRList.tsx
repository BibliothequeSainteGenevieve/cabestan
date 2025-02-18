import { useTranslation } from "react-i18next";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { BookOpen } from "lucide-react";
import { RCR } from "@/models/RCR";

type RCRListProps = {
	items: RCR[];
};

export default function RCRList({ items }: RCRListProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4">
			{items.map((rcr: RCR) => (
				<Card key={rcr.rcr} className="bg-white shadow-none border-none flex items-center justify-between">
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
								{t("RCRList.books", { count: rcr.numberOfDocuments })}
							</p>
						</CardFooter>
					</div>
					{/* 				<div className="p-6">
					<ChevronRight className="w-4 h-4" />
				</div> */}
				</Card>
			))}
		</div>
	);
}
