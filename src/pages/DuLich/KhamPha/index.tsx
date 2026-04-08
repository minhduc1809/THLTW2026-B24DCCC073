import ExpandText from '@/components/ExpandText';
import ButtonExtend from '@/components/Table/ButtonExtend';
import {
	LOAI_COLOR,
	LOAI_LABEL,
	LOAI_OPTIONS,
	RATING_FILTER_OPTIONS,
	SORT_FILTER_OPTIONS,
	getTongChiPhiDiemDen,
} from '@/pages/DuLich/constants';
import { removeHtmlTags } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, InputNumber, Modal, Rate, Row, Select, Space, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

type TAddForm = {
	idLichTrinh: string;
	ngay: string;
};

type TFilterForm = {
	loai: 'tatCa' | DuLichDiemDen.TLoaiDiemDen;
	ratingFrom?: number;
	minPrice?: number;
	maxPrice?: number;
	sortKey?: 'giaTang' | 'giaGiam' | 'ratingCao' | 'ratingThap';
};

const KhamPhaPage = () => {
	const [filterForm] = Form.useForm<TFilterForm>();
	const [addForm] = Form.useForm<TAddForm>();
	const [visibleModal, setVisibleModal] = useState(false);
	const [selectedDiemDen, setSelectedDiemDen] = useState<DuLichDiemDen.IRecord | undefined>(undefined);
	const { danhSach: diemDenList, getAllModel: getAllDiemDen } = useModel('admin.diemDen');
	const { danhSach: lichTrinhList, getAllModel: getAllLichTrinh, addDiemDenToNgay } = useModel('lichTrinh');

	useEffect(() => {
		getAllDiemDen();
		getAllLichTrinh();
	}, []);

	const loai = Form.useWatch('loai', filterForm) ?? 'tatCa';
	const ratingFrom = Form.useWatch('ratingFrom', filterForm) ?? 0;
	const minPrice = Form.useWatch('minPrice', filterForm);
	const maxPriceFilter = Form.useWatch('maxPrice', filterForm);
	const sortKey = Form.useWatch('sortKey', filterForm);
	const selectedLichTrinhId = Form.useWatch('idLichTrinh', addForm);

	const filteredList = useMemo(() => {
		let data = [...diemDenList];
		if (loai !== 'tatCa') data = data.filter((item) => item.loai === loai);
		if (ratingFrom > 0) data = data.filter((item) => item.rating >= ratingFrom);
		if (minPrice !== undefined || maxPriceFilter !== undefined) {
			data = data.filter((item) => {
				const cost = getTongChiPhiDiemDen(item);
				if (minPrice !== undefined && cost < minPrice) return false;
				if (maxPriceFilter !== undefined && cost > maxPriceFilter) return false;
				return true;
			});
		}

		switch (sortKey) {
			case 'giaTang':
				data.sort((a, b) => getTongChiPhiDiemDen(a) - getTongChiPhiDiemDen(b));
				break;
			case 'giaGiam':
				data.sort((a, b) => getTongChiPhiDiemDen(b) - getTongChiPhiDiemDen(a));
				break;
			case 'ratingThap':
				data.sort((a, b) => a.rating - b.rating);
				break;
			case 'ratingCao':
				data.sort((a, b) => b.rating - a.rating);
				break;
			default:
				break;
		}
		return data;
	}, [diemDenList, loai, ratingFrom, minPrice, maxPriceFilter, sortKey]);

	const dayOptions = useMemo(() => {
		const current = lichTrinhList.find((item) => item._id === selectedLichTrinhId);
		if (!current) return [];
		return current.danhSachNgay.map((item) => ({
			label: new Date(item.ngay).toLocaleDateString('vi-VN'),
			value: item.ngay,
		}));
	}, [selectedLichTrinhId, lichTrinhList]);

	const openAddModal = (item: DuLichDiemDen.IRecord) => {
		if (!lichTrinhList.length) {
			message.warning('Bạn cần tạo lịch trình trước khi thêm điểm đến');
			return;
		}
		setSelectedDiemDen(item);
		setVisibleModal(true);
		addForm.setFieldsValue({
			idLichTrinh: lichTrinhList[0]._id,
			ngay: lichTrinhList[0].danhSachNgay[0]?.ngay,
		});
	};

	const handleAddToLichTrinh = (values: TAddForm) => {
		if (!selectedDiemDen?._id) return;
		addDiemDenToNgay({
			idLichTrinh: values.idLichTrinh,
			ngay: values.ngay,
			diemDen: { idDiemDen: selectedDiemDen._id },
		});
		setVisibleModal(false);
		addForm.resetFields();
	};

	const handleResetFilter = () => {
		filterForm.setFieldsValue({
			loai: 'tatCa',
			ratingFrom: 0,
			minPrice: undefined,
			maxPrice: undefined,
			sortKey: undefined,
		});
	};

	return (
		<Space direction='vertical' size={16} style={{ width: '100%' }}>
			<Card title='Bộ lọc khám phá'>
				<Form
					form={filterForm}
					initialValues={{
						loai: 'tatCa',
						ratingFrom: 0,
						minPrice: undefined,
						maxPrice: undefined,
						sortKey: undefined,
					}}
				>
					<Row gutter={[12, 12]}>
						<Col xs={24} sm={12} md={6} lg={6}>
							<Form.Item name='loai' label='Loại hình' style={{ marginBottom: 0 }}>
								<Select options={LOAI_OPTIONS} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={6} lg={4}>
							<Form.Item name='ratingFrom' label='Rating từ' style={{ marginBottom: 0 }}>
								<Select options={RATING_FILTER_OPTIONS} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={6} lg={4}>
							<Form.Item name='minPrice' label='Giá từ' style={{ marginBottom: 0 }}>
								<InputNumber min={0} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={6} lg={4}>
							<Form.Item name='maxPrice' label='Giá đến' style={{ marginBottom: 0 }}>
								<InputNumber min={0} style={{ width: '100%' }} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8} lg={4}>
							<Form.Item name='sortKey' label='Sắp xếp' style={{ marginBottom: 0 }}>
								<Select allowClear placeholder='Mặc định' options={SORT_FILTER_OPTIONS} />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={4} lg={2} style={{ display: 'flex', alignItems: 'end' }}>
							<Button block onClick={handleResetFilter}>
								Reset
							</Button>
						</Col>
					</Row>
				</Form>
			</Card>

			{filteredList.length ? (
				<Row gutter={[16, 16]}>
					{filteredList.map((item) => (
						<Col key={item._id} xs={24} sm={12} md={8} lg={6}>
							<Card
								hoverable
								cover={
									item.hinhAnh ? (
										<img
											alt={item.ten}
											src={item.hinhAnh}
											style={{ height: 180, width: '100%', objectFit: 'cover' }}
										/>
									) : (
										<div
											style={{
												height: 180,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												background: '#f5f5f5',
												color: '#999',
											}}
										>
											Không có ảnh
										</div>
									)
								}
							>
								<Space direction='vertical' size={8} style={{ width: '100%' }}>
									<Row justify='space-between' align='top'>
										<Col flex='auto'>
											<Typography.Title level={5} style={{ margin: 0 }}>
												{item.ten}
											</Typography.Title>
										</Col>
										<Col>
											<Tag color={LOAI_COLOR[item.loai]}>{LOAI_LABEL[item.loai]}</Tag>
										</Col>
									</Row>
									<Rate disabled value={item.rating} style={{ fontSize: 16 }} />
									<ExpandText ellipsis={{ rows: 2 }}>{removeHtmlTags(item.moTa || '') || 'Chưa có mô tả'}</ExpandText>
									<Typography.Text strong>{getTongChiPhiDiemDen(item).toLocaleString('vi-VN')}</Typography.Text>
									<ButtonExtend
										type='primary'
										icon={<PlusOutlined />}
										notHideText
										onClick={() => openAddModal(item)}
									>
										Thêm vào lịch trình
									</ButtonExtend>
								</Space>
							</Card>
						</Col>
					))}
				</Row>
			) : (
				<Card>
					<Empty description='Không có điểm đến phù hợp bộ lọc' />
				</Card>
			)}

			<Modal
				visible={visibleModal}
				title='Thêm vào lịch trình'
				onCancel={() => setVisibleModal(false)}
				footer={null}
				destroyOnClose
			>
				<Form form={addForm} layout='vertical' onFinish={handleAddToLichTrinh}>
					<Form.Item name='idLichTrinh' label='Lịch trình' rules={[{ required: true, message: 'Bắt buộc' }]}>
						<Select
							options={lichTrinhList.map((item) => ({ label: item.ten, value: item._id }))}
							onChange={() => addForm.setFieldsValue({ ngay: undefined })}
						/>
					</Form.Item>
					<Form.Item name='ngay' label='Ngày' rules={[{ required: true, message: 'Bắt buộc' }]}>
						<Select options={dayOptions} />
					</Form.Item>
					<div className='form-footer'>
						<Button htmlType='submit' type='primary'>
							Xác nhận
						</Button>
						<Button onClick={() => setVisibleModal(false)}>Hủy</Button>
					</div>
				</Form>
			</Modal>
		</Space>
	);
};

export default KhamPhaPage;
