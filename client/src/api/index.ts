const API_HOST = "http://localhost:8082";

export const getClientConfig = async () => {
	const response = await fetch(`${API_HOST}/api/client-config`);
	return response.json();
};

export const getSuggestions = async (value: string | undefined) => {
	if (!value) return [];

	const response = await fetch(`${API_HOST}/api/rcr/suggestion?str=${value}`);
	return response.json();
};

export const getEditorsSuggestions = async (value: string | undefined) => {
	if (!value) return [];

	const response = await fetch(`${API_HOST}/api/rcr/publishers-suggestion?str=${value}`);
	return response.json();
};
