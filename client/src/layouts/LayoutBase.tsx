import Header from "@/components/Header";
import { Outlet } from "react-router";

export default function LayoutBase() {
	return (
		<div className="p-4 lg:py-4 lg:px-16">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	);
}
