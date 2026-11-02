import {
	RiArrowRightLine,
	RiCalendarLine,
	RiFileCheckLine,
} from "@remixicon/react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";

const PendingApprovals = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<div className="flex items-center justify-between">
						<p>Menunggu Persetujuan</p>
						<Badge>23 Menunggu</Badge>
					</div>
				</CardTitle>
				<CardDescription className="sr-only">
					Menunggu untuk di berikan persetujuan
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<RiCalendarLine />
							<p>Pengajuan Cuti</p>
						</div>
						<p className="flex items-center gap-4">
							12 <RiArrowRightLine className="size-4" strokeWidth={0.5} />
						</p>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<RiFileCheckLine />
							<p>Pengajuan Izin</p>
						</div>
						<p className="flex items-center gap-4">
							16 <RiArrowRightLine className="size-4" strokeWidth={0.5} />
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PendingApprovals;
