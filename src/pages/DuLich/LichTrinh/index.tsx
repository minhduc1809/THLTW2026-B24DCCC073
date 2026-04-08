import ButtonExtend from '@/components/Table/ButtonExtend';
import { CalendarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Modal, Popconfirm, Row, Space, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import ChiTietLichTrinh from '@/pages/DuLich/LichTrinh/components/ChiTietLichTrinh';
import FormLichTrinh from '@/pages/DuLich/LichTrinh/components/FormLichTrinh';

const LichTrinhPage = () => {
	const {
		danhSach,
		getAllModel,
		deleteModel,
		handleEdit,
		getTongChiPhiLichTrinh,
		setVisibleForm,
		visibleForm,
		setEdit,
		setRecord,
		record,
		edit,
	} = useModel('lichTrinh');
	const [visibleDetail, setVisibleDetail] = useState(false);
	const [detailRecord, setDetailRecord] = useState<DuLichLichTrinh.IRecord | undefined>(undefined);

	useEffect(() => {
		getAllModel();
	}, []);

	useEffect(() => {
		if (!visibleForm) getAllModel();
	}, [visibleForm]);

	const openCreateForm = () => {
		setEdit(false);
		setRecord(undefined);
		setVisibleForm(true);
	};

	return (
		<>
			<Card
				title='Lịch trình du lịch'
				extra={
					<ButtonExtend type='primary' icon={<PlusOutlined />} notHideText onClick={openCreateForm}>
						Tạo lịch trình
					</ButtonExtend>
				}
			>
				{!danhSach.length ? (
					<Empty description='Chưa có lịch trình nào' />
				) : (
					<Row gutter={[16, 16]}>
						{danhSach.map((item) => {
							const tongChiPhi = getTongChiPhiLichTrinh(item);
							const soNgay = item.danhSachNgay.length;

							return (
								<Col key={item._id} xs={24} sm={12} md={8} lg={6}>
									<Card hoverable>
										<Space direction='vertical' size={10} style={{ width: '100%' }}>
											<Typography.Title level={5} style={{ margin: 0 }}>
												{item.ten}
											</Typography.Title>
											<Space>
												<CalendarOutlined />
												<Typography.Text>
													{moment(item.ngayBatDau).format('DD/MM/YYYY')} - {moment(item.ngayKetThuc).format('DD/MM/YYYY')}
												</Typography.Text>
											</Space>
											<Typography.Text>
												Số ngày: <b>{soNgay}</b>
											</Typography.Text>
											<Typography.Text>
												Chi phí thực tế: <b>{tongChiPhi.toLocaleString('vi-VN')}</b>
											</Typography.Text>
											<Space wrap>
												<Button
													type='primary'
													icon={<EyeOutlined />}
													onClick={() => {
														setDetailRecord(item);
														setVisibleDetail(true);
													}}
												>
													Chi tiết
												</Button>
												<Button icon={<EditOutlined />} onClick={() => handleEdit(item)}>
													Sửa
												</Button>
												<Popconfirm title='Bạn có chắc muốn xóa lịch trình này?' onConfirm={() => deleteModel(item._id)}>
													<Button danger icon={<DeleteOutlined />}>
														Xóa
													</Button>
												</Popconfirm>
											</Space>
										</Space>
									</Card>
								</Col>
							);
						})}
					</Row>
				)}
			</Card>

			<Modal
				visible={visibleForm}
				destroyOnClose
				footer={null}
				title={edit ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình'}
				onCancel={() => setVisibleForm(false)}
			>
				<FormLichTrinh key={record?._id || 'create'} />
			</Modal>

			<Modal
				visible={visibleDetail}
				destroyOnClose
				width={1100}
				footer={null}
				title='Chi tiết lịch trình'
				onCancel={() => setVisibleDetail(false)}
			>
				{detailRecord ? <ChiTietLichTrinh lichTrinh={detailRecord} /> : <Empty description='Không có dữ liệu' />}
			</Modal>
		</>
	);
};

export default LichTrinhPage;
