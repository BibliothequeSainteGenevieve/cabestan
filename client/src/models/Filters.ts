export enum FilterTypes {
	LANGUAGES = "languages",
	ESTABLISHMENTS_TYPES = "establishementsTypes",
	BOOKS_TYPES = "documentsTypes",
	TERRITORIES = "territories",
	REGIONS = "regions",
	DEPARTMENTS = "departments",
	CITIES = "cities",
	PUBLISHERS = "publishers",
	PUBLICATION_DATES = "publicationDates",
	TRANSLATION_DATES = "translationDates",
	REISSUE_DATES = "reissueDates",
	NULL_VALUES = "nullValues",
}

export type OptionalFilter = {
	type?: "date";
	filter: FilterTypes;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
};
