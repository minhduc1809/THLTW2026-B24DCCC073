import UploadFile from '@/components/Upload/UploadFile';
import { LOAI_OPTIONS } from '@/pages/DuLich/constants';
import { EFileScope, buildUpLoadFile } from '@/services/uploadFile';
import rules from '@/utils/rules';
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import { useEffect } from 'react';

type TFormDiemDenProps = {
	open: boolean;
	edit: boolean;
	loading?: boolean;
	record?: DuLichDiemDen.IRecord;
	onCancel: () => void;
	onSubmit: (values: Omit<DuLichDiemDen.IRecord, '_id' | 'createdAt'>) => void;
};

type TFormValues = Omit<DuLichDiemDen.IRecord, '_id' | 'createdAt'>;

const FormDiemDen = ({ open, edit, loading, record, onCancel, onSubmit }: TFormDiemDenProps) => {
	const [form] = Form.useForm<TFormValues>();

	useEffect(() => {
		if (!open) return;
		if (!record) {
			form.resetFields();
			form.setFieldsValue({
				loai: 'bien',
				rating: 4,
				thoiGianThamQuan: 1,
				chiAn: 0,
				chiLuuTru: 0,
				chiDiChuyen: 0,
			});
			return;
		}

		form.setFieldsValue({
			...record,
			hinhAnh: record.hinhAnh || undefined,
		});
	}, [open, record?._id]);

	const submitForm = async () => {
		const values = await form.validateFields();
		const hinhAnh = await buildUpLoadFile(values, 'hinhAnh', EFileScope.PUBLIC);
		onSubmit({
			...values,
			hinhAnh: hinhAnh || undefined,
			moTa: values.moTa || '',
			chiAn: Number(values.chiAn || 0),
			chiLuuTru: Number(values.chiLuuTru || 0),
			chiDiChuyen: Number(values.chiDiChuyen || 0),
			rating: Number(values.rating || 0),
			thoiGianThamQuan: Number(values.thoiGianThamQuan || 1),
		});
	};

	return (
		<Modal
			title={edit ? 'Cập nhật điểm đến' : 'Thêm điểm đến'}
			visible={open}
			onCancel={onCancel}
			footer={null}
			width={900}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Row gutter={[16, 0]}>
					<Col xs={24} sm={24} md={12} lg={12}>
						<Form.Item name='ten' label='Tên điểm đến' rules={[...rules.required, ...rules.text]}>
							<Input placeholder='VD: Đà Lạt' />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={12} lg={12}>
						<Form.Item name='loai' label='Loại điểm đến' rules={rules.required}>
							<Select
								options={LOAI_OPTIONS.filter((item) => item.value !== 'tatCa').map((item) => ({
									label: item.label,
									value: item.value,
								}))}
							/>
						</Form.Item>
					</Col>

					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='thoiGianThamQuan' label='Số ngày tham quan' rules={rules.required}>
							<InputNumber min={1} max={30} style={{ width: '100%' }} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='rating' label='Đánh giá (1-5)' rules={rules.required}>
							<InputNumber min={1} max={5} step={0.5} style={{ width: '100%' }} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='hinhAnh' label='Ảnh minh họa'>
							<UploadFile isAvatar resize />
						</Form.Item>
					</Col>

					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='chiAn' label='Chi ăn' rules={rules.required}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='chiLuuTru' label='Chi lưu trú' rules={rules.required}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={8} lg={8}>
						<Form.Item name='chiDiChuyen' label='Chi di chuyển' rules={rules.required}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
					</Col>

					<Col span={24}>
						<Form.Item name='moTa' label='Mô tả'>
							<Input.TextArea rows={5} placeholder='Giới thiệu ngắn về điểm đến, lưu ý, kinh nghiệm...' />
						</Form.Item>
					</Col>
				</Row>

				<div className='form-footer'>
					<Button type='primary' onClick={submitForm} loading={loading}>
						{edit ? 'Lưu lại' : 'Thêm mới'}
					</Button>
					<Button onClick={onCancel}>Hủy</Button>
				</div>
			</Form>
		</Modal>
	);
};

export default FormDiemDen;
