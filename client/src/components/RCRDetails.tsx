import { Link } from "react-router";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Earth, ExternalLink, Phone } from "lucide-react";

export default function RCRDetails() {
	return (
		<div>
			<h1 className="pb-4">Montpellier - ABES - Documentation</h1>
			<div className="flex gap-2">
				<Link to="#">
					<Button variant="action">
						<ExternalLink /> https://www.abes.fr/
					</Button>
				</Link>
				<Button variant="action">
					<Phone /> 02 22 22 22 22
				</Button>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="action">
							<Earth /> 13 Langues
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 bg-white rounded-lg p-4">
						<div className="flex flex-wrap gap-2">
							<p>Français</p>
							<p>Anglais</p>
							<p>Espagnol</p>
							<p>Allemand</p>
							<p>Italien</p>
							<p>Portugais</p>
							<p>Russe</p>
							<p>Chinois</p>
							<p>Japonais</p>
							<p>Korean</p>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex pt-4">
				<div className="flex-1">
					<p className="uppercase text-sm text-grey mb-2">Adresse</p>
					<p>123 Rue de la Paix, 75000 Paris</p>
				</div>
				<div className="flex-1">
					<p className="uppercase text-sm text-grey mb-2">Contact</p>
					<p>Nom + prénom</p>
				</div>
			</div>
		</div>
	);
}
