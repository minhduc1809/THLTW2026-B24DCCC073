import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import { TabViewPage } from '@/components/TabViewPage';
import { BUDGET_CATEGORY_KEYS, BUDGET_CATEGORY_LABELS } from '@/pages/DuLich/constants';
import { BarChartOutlined, FormOutlined, ProfileOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, Input, InputNumber, Row, Select, Table, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';

type TFormValues = {
	danhMuc: DuLichNganSach.IDanhMucNganSach[];
};

const NganSachPage = () => {
	const [form] = Form.useForm<TFormValues>();
	const { danhSach, getAllModel, getCurrentRecord, upsertCurrentModel, getTongDuKien } = useModel('nganSach');
	const { danhSach: lichTrinhList, getAllModel: getAllLichTrinh } = useModel('lichTrinh');
	const { danhSach: diemDenList, getAllModel: getAllDiemDen } = useModel('admin.diemDen');
	const [selectedLichTrinhId, setSelectedLichTrinhId] = useState<string | undefined>(undefined);

	useEffect(() => {
		getAllModel();
		getAllLichTrinh();
		getAllDiemDen();
	}, []);

	useEffect(() => {
		if (!lichTrinhList.length) {
			setSelectedLichTrinhId(undefined);
			return;
		}
		if (!selectedLichTrinhId || !lichTrinhList.some((item) => item._id === selectedLichTrinhId)) {
			setSelectedLichTrinhId(lichTrinhList[0]._id);
		}
	}, [lichTrinhList, selectedLichTrinhId]);

	const currentRecord = useMemo(() => {
		if (!selectedLichTrinhId) return undefined;
		const currentFromState = danhSach.find((item) => item.idLichTrinh === selectedLichTrinhId);
		return currentFromState || getCurrentRecord(selectedLichTrinhId);
	}, [danhSach, selectedLichTrinhId]);

	useEffect(() => {
		if (!selectedLichTrinhId) {
			form.setFieldsValue({
				danhMuc: BUDGET_CATEGORY_KEYS.map((key) => ({
					key,
					label: BUDGET_CATEGORY_LABELS[key],
					duKien: 0,
					thucTe: 0,
				})),
			});
			return;
		}

		if (!currentRecord) {
			form.setFieldsValue({
				danhMuc: BUDGET_CATEGORY_KEYS.map((key) => ({
					key,
					label: BUDGET_CATEGORY_LABELS[key],
					duKien: 0,
					thucTe: 0,
				})),
			});
			return;
		}
		form.setFieldsValue({
			danhMuc: currentRecord.danhMuc.map((item) => ({
				...item,
				label: BUDGET_CATEGORY_LABELS[item.key],
			})),
		});
	}, [selectedLichTrinhId, currentRecord?._id]);

	const danhMucWatch = Form.useWatch('danhMuc', form) || currentRecord?.danhMuc || [];

	const thucTeByCategory = useMemo(() => {
		const result: Record<DuLichNganSach.TCategoryKey, number> = {
			anUong: 0,
			diChuyen: 0,
			luuTru: 0,
			khac: 0,
		};

		const lichTrinh = lichTrinhList.find((item) => item._id === selectedLichTrinhId);
		if (!lichTrinh) return result;

		const diemDenMap = new Map(diemDenList.map((item) => [item._id, item]));

		(lichTrinh.danhSachNgay || []).forEach((ngay) => {
			(ngay.diemDen || []).forEach((diemDen) => {
				const master = diemDenMap.get(diemDen.idDiemDen);
				result.anUong += Number(master?.chiAn ?? diemDen.chiAn ?? 0);
				result.diChuyen += Number(master?.chiDiChuyen ?? diemDen.chiDiChuyen ?? 0);
				result.luuTru += Number(master?.chiLuuTru ?? diemDen.chiLuuTru ?? 0);
			});
		});

		return result;
	}, [selectedLichTrinhId, lichTrinhList, diemDenList]);

	const bangKeHoachData = useMemo(() => {
		return danhMucWatch.map((item) => {
			const duKien = Number(item.duKien || 0);
			const thucTe = Number(thucTeByCategory[item.key] || 0);
			const conLai = duKien - thucTe;
			const tiTrong = 0;
			return {
				key: item.key,
				hangMuc: item.label || BUDGET_CATEGORY_LABELS[item.key],
				duKien,
				thucTe,
				conLai,
				tiTrong,
			};
		});
	}, [danhMucWatch, thucTeByCategory]);

	const tongDuKien = getTongDuKien(danhMucWatch);
	const tongThucTe = useMemo(
		() => bangKeHoachData.reduce((sum, item) => sum + Number(item.thucTe || 0), 0),
		[bangKeHoachData],
	);
	const tongConLai = tongDuKien - tongThucTe;

	const overviewData = useMemo(() => {
		return bangKeHoachData.map((item) => ({
			...item,
			tiTrong: tongDuKien ? (item.duKien / tongDuKien) * 100 : 0,
		}));
	}, [bangKeHoachData, tongDuKien]);

	const labels = bangKeHoachData.map((item) => item.hangMuc);
	const duKienValues = bangKeHoachData.map((item) => item.duKien);
	const thucTeValues = bangKeHoachData.map((item) => item.thucTe);
	const conLaiValues = bangKeHoachData.map((item) => item.conLai);

	const selectedLichTrinh = useMemo(
		() => lichTrinhList.find((item) => item._id === selectedLichTrinhId),
		[lichTrinhList, selectedLichTrinhId],
	);

	const onFinish = (values: TFormValues) => {
		if (!selectedLichTrinhId) return;
		upsertCurrentModel(selectedLichTrinhId, {
			danhMuc: values.danhMuc.map((item) => ({
				key: item.key,
				label: BUDGET_CATEGORY_LABELS[item.key],
				duKien: Number(item.duKien || 0),
				thucTe: 0,
			})),
		});
		getAllModel();
	};

	const keHoachTab = (
		<Card title='Khai báo ngân sách dự kiến'>
			<Form form={form} layout='vertical' onFinish={onFinish}>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Form.Item label='Lịch trình tính ngân sách thực tế'>
							<Select
								allowClear
								placeholder='Chọn lịch trình'
								value={selectedLichTrinhId}
								onChange={(val) => setSelectedLichTrinhId(val)}
								options={lichTrinhList.map((item) => ({
									label: item.ten,
									value: item._id,
								}))}
							/>
						</Form.Item>
					</Col>
					<Col span={24}>
						<Typography.Text type='secondary'>
							Ngân sách thực tế được lấy từ lịch trình đã chọn, sau đó tự động trừ vào ngân sách dự kiến để ra ngân sách còn lại.
						</Typography.Text>
					</Col>
					{selectedLichTrinh ? (
						<Col span={24}>
							<Alert
								type={tongConLai < 0 ? 'error' : 'success'}
								showIcon
								message={`Lịch trình đang chọn: ${selectedLichTrinh.ten}`}
								description={`Tổng dự kiến: ${tongDuKien.toLocaleString('vi-VN')} | Tổng thực tế: ${tongThucTe.toLocaleString(
									'vi-VN',
								)} | Còn lại: ${tongConLai.toLocaleString('vi-VN')}`}
							/>
						</Col>
					) : (
						<Col span={24}>
							<Alert
								type='warning'
								showIcon
								message='Chưa chọn lịch trình'
								description='Vui lòng chọn một lịch trình để quản lý ngân sách tương ứng.'
							/>
						</Col>
					)}
					<Form.List name='danhMuc'>
						{(fields) => (
							<>
								{fields.map((field) => (
									<Row key={field.key} gutter={[16, 0]} style={{ width: '100%' }}>
										<Col xs={24} sm={24} md={10} lg={10}>
											<Form.Item {...field} name={[field.name, 'label']} label='Hạng mục'>
												<Input disabled />
											</Form.Item>
											<Form.Item {...field} name={[field.name, 'key']} hidden>
												<Input />
											</Form.Item>
										</Col>
										<Col xs={24} sm={24} md={14} lg={14}>
											<Form.Item
												{...field}
												name={[field.name, 'duKien']}
												label='Ngân sách dự kiến'
												rules={[{ required: true, message: 'Bắt buộc' }]}
											>
												<InputNumber min={0} style={{ width: '100%' }} />
											</Form.Item>
										</Col>
									</Row>
								))}
							</>
						)}
					</Form.List>

					<Col span={24}>
						<Table
							size='small'
							pagination={false}
							dataSource={bangKeHoachData}
							columns={[
								{ title: 'Hạng mục', dataIndex: 'hangMuc', key: 'hangMuc' },
								{
									title: 'Ngân sách dự kiến',
									dataIndex: 'duKien',
									key: 'duKien',
									align: 'right',
									render: (val: number) => <b>{Number(val || 0).toLocaleString('vi-VN')}</b>,
								},
								{
									title: 'Ngân sách thực tế',
									dataIndex: 'thucTe',
									key: 'thucTe',
									align: 'right',
									render: (val: number) => Number(val || 0).toLocaleString('vi-VN'),
								},
								{
									title: 'Ngân sách còn lại',
									dataIndex: 'conLai',
									key: 'conLai',
									align: 'right',
									render: (val: number) => <Tag color={val < 0 ? 'red' : 'green'}>{Number(val || 0).toLocaleString('vi-VN')}</Tag>,
								},
							]}
							summary={() => (
								<Table.Summary.Row>
									<Table.Summary.Cell index={0}>
										<b>Tổng</b>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={1} align='right'>
										<b>{tongDuKien.toLocaleString('vi-VN')}</b>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={2} align='right'>
										<b>{tongThucTe.toLocaleString('vi-VN')}</b>
									</Table.Summary.Cell>
									<Table.Summary.Cell index={3} align='right'>
										<b style={{ color: tongConLai < 0 ? '#ff4d4f' : '#389e0d' }}>{tongConLai.toLocaleString('vi-VN')}</b>
									</Table.Summary.Cell>
								</Table.Summary.Row>
							)}
						/>
					</Col>
				</Row>
				<div className='form-footer'>
					<Button type='primary' htmlType='submit'>
						Lưu ngân sách
					</Button>
				</div>
			</Form>
		</Card>
	);

	const tongQuanTab = (
		<>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={24} md={8} lg={8}>
					<Card>
						<Typography.Text type='secondary'>Tổng ngân sách dự kiến</Typography.Text>
						<Typography.Title level={3} style={{ marginBottom: 0 }}>
							{tongDuKien.toLocaleString('vi-VN')}
						</Typography.Title>
					</Card>
				</Col>
				<Col xs={24} sm={24} md={8} lg={8}>
					<Card>
						<Typography.Text type='secondary'>Tổng ngân sách thực tế</Typography.Text>
						<Typography.Title level={3} style={{ marginBottom: 0 }}>
							{tongThucTe.toLocaleString('vi-VN')}
						</Typography.Title>
					</Card>
				</Col>
				<Col xs={24} sm={24} md={8} lg={8}>
					<Card>
						<Typography.Text type='secondary'>Ngân sách còn lại</Typography.Text>
						<Typography.Title level={3} style={{ marginBottom: 0 }}>
							{tongConLai.toLocaleString('vi-VN')}
						</Typography.Title>
					</Card>
				</Col>
			</Row>

			<Card title='Bảng ngân sách tổng quan' style={{ marginTop: 16 }}>
				<Table
					pagination={false}
					dataSource={overviewData}
					columns={[
						{ title: 'Hạng mục', dataIndex: 'hangMuc', key: 'hangMuc' },
						{
							title: 'Dự kiến',
							dataIndex: 'duKien',
							key: 'duKien',
							align: 'right',
							render: (val: number) => <b>{Number(val || 0).toLocaleString('vi-VN')}</b>,
						},
						{
							title: 'Tỷ trọng',
							dataIndex: 'tiTrong',
							key: 'tiTrong',
							align: 'center',
							render: (val: number) => <Tag color='blue'>{val.toFixed(1)}%</Tag>,
						},
					]}
					summary={() => (
						<Table.Summary.Row>
							<Table.Summary.Cell index={0}>
								<b>Tổng</b>
							</Table.Summary.Cell>
							<Table.Summary.Cell index={1} align='right'>
								<b>{tongDuKien.toLocaleString('vi-VN')}</b>
							</Table.Summary.Cell>
							<Table.Summary.Cell index={2} align='center'>
								<b>100%</b>
							</Table.Summary.Cell>
						</Table.Summary.Row>
					)}
				/>
			</Card>
		</>
	);

	const bieuDoTab = (
		<Row gutter={[16, 16]}>
			<Col xs={24} sm={24} md={24} lg={12}>
				<Card title='Phân bổ ngân sách dự kiến'>
					<DonutChart
						xAxis={labels}
						yAxis={[duKienValues]}
						yLabel={['Dự kiến']}
						showTotal
						height={340}
						formatY={(val) => `${val.toLocaleString('vi-VN')}`}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={24} md={24} lg={12}>
				<Card title='Dự kiến - thực tế - còn lại theo hạng mục'>
					<ColumnChart
						title='So sánh ngân sách'
						xAxis={labels}
						yAxis={[duKienValues, thucTeValues, conLaiValues]}
						yLabel={['Dự kiến', 'Thực tế', 'Còn lại']}
						colors={['#1890ff', '#fa8c16', '#52c41a']}
						height={340}
						formatY={(val) => `${val.toLocaleString('vi-VN')}`}
					/>
				</Card>
			</Col>
		</Row>
	);

	return (
		<TabViewPage
			cardTitle='Ngân sách du lịch'
			menu={[
				{ title: 'Kế hoạch', menuKey: 'ke-hoach', icon: <FormOutlined />, content: keHoachTab },
				{ title: 'Tổng quan', menuKey: 'tong-quan', icon: <ProfileOutlined />, content: tongQuanTab },
				{ title: 'Biểu đồ', menuKey: 'bieu-do', icon: <BarChartOutlined />, content: bieuDoTab },
			]}
		/>
	);
};

export default NganSachPage;
