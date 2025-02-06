import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n/config";
import HomePage from "./pages/HomePage";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<HomePage />
		</QueryClientProvider>
	);
}

export default App;
