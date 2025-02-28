export type Document = {
	title: string;
	author?: {
		firstname: string;
		lastname: string;
	};
	translator?: string;
	publisher?: string;
	publication_date?: string;
	publication_city?: string;
	original_language?: string;
	type: string;
	publication_place?: string;
	tags?: string[];
};
