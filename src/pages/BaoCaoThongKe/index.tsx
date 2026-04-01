import { Card, Col, Row, Statistic, Empty } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import ColumnChart from '@/components/Chart/ColumnChart';
import { DonDangKyRecord } from '@/models/dondangky';
import { CauLacBoRecord } from '@/models/caulacbo';

const BaoCaoThongKePage: React.FC = () => {
	const dondangkyModel = useModel('dondangky');
	const caulacboModel = useModel('caulacbo');

	useEffect(() => {
		dondangkyModel.getModel();
		caulacboModel.getModel();
	}, []);

    const activeClubs = caulacboModel.danhSach.filter((c: CauLacBoRecord) => c.hoatDong);
	const totalCLB = activeClubs.length;

	let pending = 0;
	let approved = 0;
	let rejected = 0;

	dondangkyModel.danhSach.forEach((item: DonDangKyRecord) => {
		if (item.trangThai === 'Pending') pending++;
		else if (item.trangThai === 'Approved') approved++;
		else if (item.trangThai === 'Rejected') rejected++;
	});

	const xAxisTitle = activeClubs.map((clb: CauLacBoRecord) => clb.ten);
	
	const yAxisPending: number[] = [];
	const yAxisApproved: number[] = [];
	const yAxisRejected: number[] = [];

	activeClubs.forEach((clb: CauLacBoRecord) => {
		const dons = dondangkyModel.danhSach.filter((d: DonDangKyRecord) => d.idCauLacBo === clb._id);
		yAxisPending.push(dons.filter((d: DonDangKyRecord) => d.trangThai === 'Pending').length);
		yAxisApproved.push(dons.filter((d: DonDangKyRecord) => d.trangThai === 'Approved').length);
		yAxisRejected.push(dons.filter((d: DonDangKyRecord) => d.trangThai === 'Rejected').length);
	});

	const yAxis = [yAxisPending, yAxisApproved, yAxisRejected];
	const yLabel = ['Chờ duyệt (Pending)', 'Đã duyệt (Approved)', 'Từ chối (Rejected)'];
	const colors = ['#faad14', '#52c41a', '#f5222d'];

	return (
		<Card title='Báo cáo Thống kê' bordered={false}>
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col span={6}>
					<Card>
						<Statistic title="Tổng số Câu lạc bộ (Đang HĐ)" value={totalCLB} valueStyle={{ color: '#1890ff' }} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Đơn đang chờ duyệt" value={pending} valueStyle={{ color: '#faad14' }} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Đơn đã được duyệt" value={approved} valueStyle={{ color: '#52c41a' }} />
					</Card>
				</Col>
				<Col span={6}>
					<Card>
						<Statistic title="Đơn bị từ chối" value={rejected} valueStyle={{ color: '#f5222d' }} />
					</Card>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card title='Thống kê Số lượng Đơn đăng ký theo từng CLB'>
                        {xAxisTitle.length > 0 ? (
                            <ColumnChart
                                title=''
                                xAxis={xAxisTitle}
                                yAxis={yAxis}
                                yLabel={yLabel}
                                colors={colors}
                            />
                        ) : (
                            <Empty description='Chưa có Câu lạc bộ nào đang hoạt động' />
                        )}
					</Card>
				</Col>
			</Row>
		</Card>
	);
};

export default BaoCaoThongKePage;
