import { useParams } from "react-router";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Earth, ExternalLink, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRCRDetails } from "@/api";
import { useTranslation } from "react-i18next";

export default function RCRDetails() {
	const { rcr } = useParams();
	const { t } = useTranslation();

	const { data: rcrDetails } = useQuery({
		queryKey: ["rcr-details", rcr],
		queryFn: () => getRCRDetails(rcr),
	});

	if (!rcrDetails) return null;

	return (
		<div>
			<h1 className="pb-4">{rcrDetails.name}</h1>
			<div className="flex gap-4">
				{rcrDetails.contact.website && (
					<a href={rcrDetails.contact.website} target="_blank">
						<Button variant="action">
							<ExternalLink /> {rcrDetails.contact.website}
						</Button>
					</a>
				)}
				{rcrDetails.contact.phone && (
					<a href={`tel:${rcrDetails.contact.phone}`}>
						<Button variant="action">
							<Phone /> {rcrDetails.contact.phone}
						</Button>
					</a>
				)}
				{rcrDetails.languages.length > 0 && (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="action">
								<Earth /> {t("RCRDetails.language_other", { count: rcrDetails.languages.length })}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80 bg-white rounded-lg p-4">
							<div className="flex flex-wrap gap-2">
								{rcrDetails.languages.map((language, index) => (
									<p key={language}>
										{language}
										{index < rcrDetails.languages.length - 1 && ", "}
									</p>
								))}
							</div>
						</PopoverContent>
					</Popover>
				)}
			</div>
			<div className="flex pt-4">
				<div className="flex-1">
					<p className="uppercase text-sm text-grey mb-2">{t("RCRDetails.address")}</p>
					<p className="font-light">
						<a
							href={`https://maps.google.com/?q=${rcrDetails.name} ${rcrDetails.contact.address.street} ${rcrDetails.contact.address.postalCode} ${rcrDetails.contact.address.city}, ${rcrDetails.contact.address.country}`}
							target="_blank">
							{rcrDetails.contact.address.street}, {rcrDetails.contact.address.postalCode}
							<br />
							{rcrDetails.contact.address.city}, {rcrDetails.contact.address.country}
						</a>
					</p>
				</div>
				<div className="flex-1">
					<p className="uppercase text-sm text-grey mb-2">{t("RCRDetails.contact")}</p>
					<p className="font-light">
						<a href={`mailto:${rcrDetails.contact.email}`}>{rcrDetails.contact.email}</a>
					</p>
				</div>
			</div>
		</div>
	);
}
