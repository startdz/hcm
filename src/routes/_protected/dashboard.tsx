import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<section className="p-4">
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, nostrum
			porro! Consectetur quo omnis illum odio sint esse, voluptatibus nemo nihil
			cumque consequatur veritatis aliquam sequi mollitia distinctio ad autem.
		</section>
	);
}
