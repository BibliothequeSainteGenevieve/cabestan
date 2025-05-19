import HomePage from "./HomePage";
import RCRPage from "./RCRPage";

export const routes = {
	home: {
		path: "/",
		element: <HomePage />,
	},
	rcr: {
		path: "/rcr/:rcr",
		element: <RCRPage />,
	},
};
