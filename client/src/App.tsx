import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n/config";
import HomePage from "./pages/HomePage";
import { BrowserRouter, Routes, Route } from "react-router";
import LayoutBase from "./layouts/LayoutBase";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: import.meta.env.VITE_CACHE_TTL?import.meta.env.VITE_CACHE_TTL:1000, // 1 second
			// gcTime: 1000 * 60 * 60 * 24, // 24 hours
			staleTime: import.meta.env.VITE_CACHE_TTL?import.meta.env.VITE_CACHE_TTL:1000, // 1 second
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Routes>
					<Route element={<LayoutBase />}>
						<Route path="/search?" element={<HomePage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
