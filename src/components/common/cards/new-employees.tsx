import { RiGroupLine } from "@remixicon/react";
import { cn } from "cn";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type Props = React.ComponentProps<typeof Card>;

const NewEmployees = ({ className, ...props }: Props) => {
	return (
		<Card className={cn(className)} {...props}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<RiGroupLine />
					<Badge variant="outline">Bulan ini</Badge>
				</div>
				<CardTitle>
					<p>48</p>
					<p>Karyawan Baru</p>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Lihat Selengkapnya</p>
			</CardContent>
		</Card>
	);
};

export default NewEmployees;
