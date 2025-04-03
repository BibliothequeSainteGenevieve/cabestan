import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import i18next from "i18next";

const LanguageSelect = () => {
	const [language, setLanguage] = useState(i18next.language);

	const handleLanguageChange = (value: string) => {
		setLanguage(value);
		i18next.changeLanguage(value);
	};

	return (
		<Select value={language} onValueChange={handleLanguageChange}>
			<SelectTrigger className="w-[100px]">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="en">English</SelectItem>
				<SelectItem value="fr">Français</SelectItem>
			</SelectContent>
		</Select>
	);
};

export default LanguageSelect;
