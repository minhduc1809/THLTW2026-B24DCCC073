import rules from '@/utils/rules';
import { Button, Col, DatePicker, Form, Input, Row } from 'antd';
import moment, { Moment } from 'moment';
import { useEffect } from 'react';
import { useModel } from 'umi';

type TFormValues = {
	ten: string;
	ngayBatDau: Moment;
	ngayKetThuc: Moment;
};

const FormLichTrinh = () => {
	const [form] = Form.useForm<TFormValues>();
	const { record, edit, postModel, putModel, formSubmiting, setVisibleForm } = useModel('lichTrinh');

	useEffect(() => {
		if (!edit || !record) {
			form.resetFields();
			return;
		}

		form.setFieldsValue({
			ten: record.ten,
			ngayBatDau: moment(record.ngayBatDau),
			ngayKetThuc: moment(record.ngayKetThuc),
		});
	}, [record?._id, edit]);

	const onFinish = (values: TFormValues) => {
		const payload = {
			ten: values.ten,
			ngayBatDau: values.ngayBatDau.toISOString(),
			ngayKetThuc: values.ngayKetThuc.toISOString(),
		};

		if (edit && record?._id) putModel(record._id, payload);
		else postModel(payload);
	};

	const ngayBatDau = Form.useWatch('ngayBatDau', form);

	return (
		<Form form={form} layout='vertical' onFinish={onFinish}>
			<Row gutter={[16, 0]}>
				<Col span={24}>
					<Form.Item name='ten' label='Tên lịch trình' rules={[...rules.required, ...rules.text]}>
						<Input placeholder='VD: Du lịch miền Trung 4N3Đ' />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12} md={12} lg={12}>
					<Form.Item name='ngayBatDau' label='Ngày bắt đầu' rules={rules.required}>
						<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12} md={12} lg={12}>
					<Form.Item
						name='ngayKetThuc'
						label='Ngày kết thúc'
						rules={[
							...rules.required,
							{
								validator: (_rule, value) => {
									if (!value || !ngayBatDau || !moment(ngayBatDau).isAfter(value, 'day')) return Promise.resolve();
									return Promise.reject('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
								},
							},
						]}
					>
						<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
					</Form.Item>
				</Col>
			</Row>

			<div className='form-footer'>
				<Button type='primary' htmlType='submit' loading={formSubmiting}>
					{edit ? 'Lưu lại' : 'Tạo lịch trình'}
				</Button>
				<Button onClick={() => setVisibleForm(false)}>Hủy</Button>
			</div>
		</Form>
	);
};

export default FormLichTrinh;
