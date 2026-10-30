import {
	RiArrowUpDownFill,
	RiCheckFill,
	RiFlipVertical2Fill,
} from "@remixicon/react";
import * as React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function VersionSwitcher({
	versions,
	defaultVersion,
}: {
	versions: string[];
	defaultVersion: string;
}) {
	const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
							/>
						}
					>
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<RiFlipVertical2Fill className="size-4" />
						</div>
						<div className="flex flex-col gap-0.5 leading-none">
							<span className="font-medium">Documentation</span>
							<span>v{selectedVersion}</span>
						</div>
						<RiArrowUpDownFill className="ml-auto" />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--anchor-width) min-w-(--anchor-width)"
						align="start"
					>
						{versions.map((version) => (
							<DropdownMenuItem
								key={version}
								onClick={() => setSelectedVersion(version)}
							>
								v{version}
								{version === selectedVersion && (
									<RiCheckFill className="ml-auto" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
