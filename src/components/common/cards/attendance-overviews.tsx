import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

const AttendanceOverviews = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<div className="flex items-center justify-between">
						<p>Kehadiran Hari Ini</p>
						<Badge>30 Oktober 2026</Badge>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4 sm:space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p>1,052</p>
							<p>Hadir</p>
						</div>
						<div>
							<p>42</p>
							<p>Tidak Hadir</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p>18</p>
							<p>Terlambat</p>
						</div>
						<div>
							<p>83</p>
							<p>Cuti/Izin</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default AttendanceOverviews;
