export type RCR = {
	rcr: string;
	name: string;
	translatedName: string;
	numberOfDocuments: number;
	contact: {
		website: string;
		phone: string;
		email: string;
		address: {
			street: string;
			postalCode: string;
			city: string;
			country: string;
		};
	};
	location: {
		longitude: number;
		latitude: number;
	};
	languages: {
		count: number;
		supported: string[];
	};
	metadata: {
		author: string;
		publicationPlace: string;
		publisher: string;
		publicationDate: string;
		documentLanguage: string;
		tags: string[];
	};
};

export type MapRCR = {
	rcr: string;
	name: string;
	numberOfDocuments: number;
	contact: {
		address: {
			street: string;
			postalCode: string;
			city: string;
			country: string;
		};
	};
	location: {
		longitude: number;
		latitude: number;
	};
};
