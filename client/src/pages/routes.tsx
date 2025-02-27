import HomePage from "./HomePage";
import RCRPage from "./RCRPage";

export const routes = {
	home: {
		path: "/search?",
		element: <HomePage />,
	},
	rcr: {
		path: "/rcr/:rcr",
		element: <RCRPage />,
	},
};
