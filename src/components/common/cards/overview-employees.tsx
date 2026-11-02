import { RiArrowRightUpFill, RiGroupLine } from "@remixicon/react";
import { cn } from "cn";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type Props = React.ComponentProps<typeof Card>;

const OverviewEmployees = ({ className, ...props }: Props) => {
	return (
		<Card className={cn(className)} {...props}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<RiGroupLine />
					<Badge>
						+5.2 % <RiArrowRightUpFill />
					</Badge>
				</div>
				<CardTitle>
					<p>1,248</p>
					<p>Total Karyawan</p>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Lihat Selengkapnya</p>
			</CardContent>
		</Card>
	);
};

export default OverviewEmployees;
