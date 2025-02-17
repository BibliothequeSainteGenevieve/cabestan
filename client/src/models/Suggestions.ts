export type GlobalSuggestion = {
	title: string;
	subtitle: string;
	type: GlobalSuggestionType;
};

export enum GlobalSuggestionType {
	LIBRARY = "rcr",
	DOCUMENT = "document",
	AUTHOR = "author",
	ILLUSTRATOR = "illustrator",
	TRANSLATOR = "translator",
}
