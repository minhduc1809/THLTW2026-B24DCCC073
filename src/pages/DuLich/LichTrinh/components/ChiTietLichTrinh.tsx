import { LOAI_COLOR, LOAI_LABEL, getTongChiPhiNgay } from '@/pages/DuLich/constants';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

type TProps = {
	lichTrinh: DuLichLichTrinh.IRecord;
};

const TRAVEL_TIME_BETWEEN_POINTS_HOUR = 2;

const ChiTietLichTrinh = ({ lichTrinh }: TProps) => {
	const { danhSach, getAllModel: getAllLichTrinh, addDiemDenToNgay, removeDiemDenKhoiNgay, sortDiemDenTrongNgay } = useModel(
		'lichTrinh',
	);
	const { danhSach: danhSachDiemDen, getAllModel: getAllDiemDen } = useModel('admin.diemDen');
	const [selectedByDay, setSelectedByDay] = useState<Record<string, string | undefined>>({});

	useEffect(() => {
		getAllLichTrinh();
		getAllDiemDen();
	}, []);

	const currentLichTrinh = useMemo(
		() => danhSach.find((item) => item._id === lichTrinh._id) || lichTrinh,
		[danhSach, lichTrinh._id],
	);

	const diemDenMap = useMemo(() => {
		const map = new Map<string, DuLichDiemDen.IRecord>();
		danhSachDiemDen.forEach((item) => map.set(item._id, item));
		return map;
	}, [danhSachDiemDen]);

	const addToDay = async (ngay: string) => {
		const selectedId = selectedByDay[ngay];
		if (!selectedId) return;
		addDiemDenToNgay({
			idLichTrinh: currentLichTrinh._id,
			ngay,
			diemDen: { idDiemDen: selectedId },
		});
		setSelectedByDay((prev) => ({ ...prev, [ngay]: undefined }));
		await getAllLichTrinh();
	};

	const columns: ColumnsType<DuLichLichTrinh.IDiemDenNgay & { index: number }> = [
		{
			title: '#',
			dataIndex: 'index',
			width: 52,
			align: 'center',
		},
		{
			title: 'Điểm đến',
			dataIndex: 'idDiemDen',
			render: (id: string) => {
				const item = diemDenMap.get(id);
				if (!item) return <Typography.Text type='secondary'>Điểm đến đã bị xóa</Typography.Text>;
				return (
					<Space>
						<span>{item.ten}</span>
						<Tag color={LOAI_COLOR[item.loai]}>{LOAI_LABEL[item.loai]}</Tag>
					</Space>
				);
			},
		},
		{
			title: 'Thời gian di chuyển',
			dataIndex: 'travelTime',
			align: 'center',
			width: 180,
			render: (_: unknown, __: DuLichLichTrinh.IDiemDenNgay & { index: number }, idx: number) =>
				idx === 0 ? <Tag>Điểm đầu ngày</Tag> : <Tag color='processing'>{TRAVEL_TIME_BETWEEN_POINTS_HOUR} giờ</Tag>,
		},
		{
			title: 'Chi phí/ngày',
			dataIndex: 'chiPhi',
			align: 'right',
			width: 140,
			render: (_: unknown, rec) => {
				const item = diemDenMap.get(rec.idDiemDen);
				return Number(getTongChiPhiNgay(item || rec)).toLocaleString('vi-VN');
			},
		},
		{
			title: 'Thao tác',
			width: 170,
			render: (_: unknown, rec, idx) => {
				return (
					<Space>
						<Button
							size='small'
							icon={<ArrowUpOutlined />}
							disabled={idx === 0}
							onClick={() =>
								sortDiemDenTrongNgay({
									idLichTrinh: currentLichTrinh._id,
									ngay: (rec as any).ngay,
									idDiemDen: rec.idDiemDen,
									newIndex: idx - 1,
								})
							}
						/>
						<Button
							size='small'
							icon={<ArrowDownOutlined />}
							onClick={() =>
								sortDiemDenTrongNgay({
									idLichTrinh: currentLichTrinh._id,
									ngay: (rec as any).ngay,
									idDiemDen: rec.idDiemDen,
									newIndex: idx + 1,
								})
							}
						/>
						<Button
							size='small'
							danger
							icon={<DeleteOutlined />}
							onClick={() =>
								removeDiemDenKhoiNgay({
									idLichTrinh: currentLichTrinh._id,
									ngay: (rec as any).ngay,
									idDiemDen: rec.idDiemDen,
								})
							}
						/>
					</Space>
				);
			},
		},
	];

	if (!currentLichTrinh?.danhSachNgay?.length) return <Empty description='Lịch trình chưa có ngày nào' />;

	return (
		<Row gutter={[16, 16]}>
			{currentLichTrinh.danhSachNgay.map((ngayItem) => {
				const optionList = danhSachDiemDen.map((item) => ({
					label: `${item.ten} - ${getTongChiPhiNgay(item).toLocaleString('vi-VN')}`,
					value: item._id,
				}));
				const tableData = ngayItem.diemDen.map((item, index) => ({ ...item, index: index + 1, ngay: ngayItem.ngay }));
				const tongNgay = tableData.reduce((sum, item) => {
					const master = diemDenMap.get(item.idDiemDen);
					return sum + getTongChiPhiNgay(master || item);
				}, 0);
				const tongThoiGianDiChuyen = Math.max(tableData.length - 1, 0) * TRAVEL_TIME_BETWEEN_POINTS_HOUR;

				return (
					<Col key={ngayItem.ngay} span={24}>
						<Card
							title={`Ngày ${moment(ngayItem.ngay).format('DD/MM/YYYY')}`}
							extra={`Tổng ngày: ${tongNgay.toLocaleString('vi-VN')} | Di chuyển: ${tongThoiGianDiChuyen} giờ`}
						>
							<Space style={{ marginBottom: 12 }} wrap>
								<Select
									allowClear
									showSearch
									placeholder='Chọn điểm đến để thêm vào ngày'
									value={selectedByDay[ngayItem.ngay]}
									onChange={(val) => setSelectedByDay((prev) => ({ ...prev, [ngayItem.ngay]: val }))}
									style={{ minWidth: 320 }}
									options={optionList}
									filterOption={(input, option) =>
										String(option?.label || '')
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
								<Button type='primary' icon={<PlusOutlined />} onClick={() => addToDay(ngayItem.ngay)}>
									Thêm điểm đến
								</Button>
							</Space>

							<Table
								rowKey={(item, index) => `${item.idDiemDen}_${index}`}
								columns={columns}
								dataSource={tableData}
								pagination={false}
								size='small'
							/>

							<Typography.Text type='secondary'>
								Ước tính thời gian di chuyển giữa 2 điểm liên tiếp: {TRAVEL_TIME_BETWEEN_POINTS_HOUR} giờ.
							</Typography.Text>
						</Card>
					</Col>
				);
			})}
		</Row>
	);
};

export default ChiTietLichTrinh;
