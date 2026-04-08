import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import { LOAI_COLOR, LOAI_LABEL, getTongChiPhiDiemDen } from '@/pages/DuLich/constants';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Image, Modal, Row, Space, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
import FormDiemDen from './components/FormDiemDen';

const AdminDiemDenPage = () => {
	const {
		danhSach,
		loading,
		formSubmiting,
		record,
		edit,
		visibleForm,
		setVisibleForm,
		setEdit,
		setRecord,
		getAllModel,
		postModel,
		putModel,
		deleteModel,
		handleEdit,
	} = useModel('admin.diemDen');

	const [confirmDeleteId, setConfirmDeleteId] = useState<string | undefined>(undefined);

	useEffect(() => {
		getAllModel();
	}, []);

	const tongChiPhi = useMemo(() => danhSach.reduce((sum, item) => sum + getTongChiPhiDiemDen(item), 0), [danhSach]);
	const trungBinhRating = useMemo(
		() => (danhSach.length ? danhSach.reduce((sum, item) => sum + Number(item.rating || 0), 0) / danhSach.length : 0),
		[danhSach],
	);
	const diemDenChiPhiCaoNhat = useMemo(
		() => [...danhSach].sort((a, b) => getTongChiPhiDiemDen(b) - getTongChiPhiDiemDen(a))[0],
		[danhSach],
	);

	const thongKeLoai = useMemo(() => {
		const map: Record<DuLichDiemDen.TLoaiDiemDen, number> = { bien: 0, nui: 0, thanhPho: 0 };
		danhSach.forEach((item) => {
			map[item.loai] = (map[item.loai] || 0) + 1;
		});
		return map;
	}, [danhSach]);

	const thongKeThang = useMemo(() => {
		const map = new Map<string, number>();
		danhSach.forEach((item) => {
			const d = new Date(item.createdAt);
			const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
			map.set(key, (map.get(key) || 0) + 1);
		});
		return Array.from(map.entries()).sort((a, b) => {
			const [m1, y1] = a[0].split('/').map(Number);
			const [m2, y2] = b[0].split('/').map(Number);
			return y1 === y2 ? m1 - m2 : y1 - y2;
		});
	}, [danhSach]);

	const columns: ColumnsType<DuLichDiemDen.IRecord> = [
		{
			title: 'Tên điểm đến',
			dataIndex: 'ten',
			width: 180,
			render: (text, rec) => (
				<Space>
					{rec.hinhAnh ? <Image src={rec.hinhAnh} width={56} height={42} style={{ objectFit: 'cover' }} /> : null}
					<span>{text}</span>
				</Space>
			),
		},
		{
			title: 'Loại',
			dataIndex: 'loai',
			width: 120,
			render: (val: DuLichDiemDen.TLoaiDiemDen) => <Tag color={LOAI_COLOR[val]}>{LOAI_LABEL[val]}</Tag>,
		},
		{
			title: 'Số ngày',
			dataIndex: 'thoiGianThamQuan',
			width: 90,
			align: 'center',
		},
		{
			title: 'Rating',
			dataIndex: 'rating',
			width: 90,
			align: 'center',
		},
		{
			title: 'Chi ăn',
			dataIndex: 'chiAn',
			width: 110,
			align: 'right',
			render: (val: number) => Number(val || 0).toLocaleString('vi-VN'),
		},
		{
			title: 'Chi lưu trú',
			dataIndex: 'chiLuuTru',
			width: 120,
			align: 'right',
			render: (val: number) => Number(val || 0).toLocaleString('vi-VN'),
		},
		{
			title: 'Chi di chuyển',
			dataIndex: 'chiDiChuyen',
			width: 130,
			align: 'right',
			render: (val: number) => Number(val || 0).toLocaleString('vi-VN'),
		},
		{
			title: 'Tổng/ngày',
			dataIndex: 'chiPhiNgay',
			width: 120,
			align: 'right',
			render: (_val: number, rec) => getTongChiPhiDiemDen(rec).toLocaleString('vi-VN'),
		},
		{
			title: 'Thao tác',
			width: 120,
			fixed: 'right',
			render: (_text, rec) => (
				<Space>
					<Button
						type='text'
						icon={<EditOutlined />}
						onClick={() => {
							handleEdit(rec);
						}}
					/>
					<Button type='text' danger icon={<DeleteOutlined />} onClick={() => setConfirmDeleteId(rec._id)} />
				</Space>
			),
		},
	];

	const submitForm = (values: Omit<DuLichDiemDen.IRecord, '_id' | 'createdAt'>) => {
		if (edit && record?._id) putModel(record._id, values);
		else postModel(values);
		setTimeout(() => {
			getAllModel();
		}, 0);
	};

	const removeRecord = () => {
		if (!confirmDeleteId) return;
		deleteModel(confirmDeleteId);
		setConfirmDeleteId(undefined);
		setTimeout(() => {
			getAllModel();
		}, 0);
	};

	return (
		<>
			<Card
				title='Quản trị điểm đến'
				extra={
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEdit(false);
							setRecord(undefined);
							setVisibleForm(true);
						}}
					>
						Thêm điểm đến
					</Button>
				}
			>
				<Row gutter={[16, 16]}>
					<Col xs={24} sm={12} md={8} lg={8}>
						<Card>
							<Statistic title='Tổng điểm đến' value={danhSach.length} />
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={8}>
						<Card>
							<Statistic title='Trung bình rating' value={Number(trungBinhRating.toFixed(1))} />
						</Card>
					</Col>
					<Col xs={24} sm={12} md={8} lg={8}>
						<Card>
							<Statistic title='Tổng chi phí/ngày' value={tongChiPhi} formatter={(val) => Number(val).toLocaleString('vi-VN')} />
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]} style={{ marginTop: 8 }}>
					<Col xs={24} sm={24} md={24} lg={12}>
						<Card title='Phân bố loại điểm đến'>
							<DonutChart
								xAxis={Object.values(LOAI_LABEL)}
								yAxis={[[thongKeLoai.bien, thongKeLoai.nui, thongKeLoai.thanhPho]]}
								yLabel={['Số lượng']}
								showTotal
								height={320}
							/>
						</Card>
					</Col>
					<Col xs={24} sm={24} md={24} lg={12}>
						<Card title='Số điểm đến theo tháng tạo'>
							<ColumnChart
								title='Điểm đến'
								xAxis={thongKeThang.map((item) => item[0])}
								yAxis={[thongKeThang.map((item) => item[1])]}
								yLabel={['Số lượng']}
								height={320}
							/>
						</Card>
					</Col>
				</Row>

				<Card
					title='Danh sách điểm đến'
					style={{ marginTop: 16 }}
					extra={
						diemDenChiPhiCaoNhat
							? `Chi phí/ngày cao nhất: ${diemDenChiPhiCaoNhat.ten} (${getTongChiPhiDiemDen(
									diemDenChiPhiCaoNhat,
							  ).toLocaleString('vi-VN')})`
							: ''
					}
				>
					<Table
						rowKey='_id'
						loading={loading}
						columns={columns}
						dataSource={danhSach}
						scroll={{ x: 1200 }}
						pagination={{ pageSize: 10, showSizeChanger: false }}
					/>
				</Card>
			</Card>

			<FormDiemDen
				open={visibleForm}
				edit={edit}
				record={record}
				loading={formSubmiting}
				onCancel={() => setVisibleForm(false)}
				onSubmit={submitForm}
			/>

			<Modal
				title='Xác nhận xóa'
				visible={!!confirmDeleteId}
				onOk={removeRecord}
				onCancel={() => setConfirmDeleteId(undefined)}
				okText='Xóa'
				cancelText='Hủy'
				okButtonProps={{ danger: true }}
			>
				Bạn có chắc chắn muốn xóa điểm đến này?
			</Modal>
		</>
	);
};

export default AdminDiemDenPage;
