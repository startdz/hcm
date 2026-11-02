import { RiUserFollowLine } from "@remixicon/react";
import { cn } from "cn";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type Props = React.ComponentProps<typeof Card>;

const ActiveEmployees = ({ className, ...props }: Props) => {
	return (
		<Card className={cn(className)} {...props}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<RiUserFollowLine />
					<Badge>98,4 %</Badge>
				</div>
				<CardTitle>
					<p>1,195</p>
					<p>Karyawan Aktif</p>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Lihat Selengkapnya</p>
			</CardContent>
		</Card>
	);
};

export default ActiveEmployees;
