import { Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import rules from '@/utils/rules';
import { CauLacBoRecord } from '@/models/caulacbo';

const FormDonDangKy: React.FC = () => {
	const { visibleForm, setVisibleForm, edit, isView, record, postModel, putModel, formSubmiting } = useModel('dondangky');
	const caulacboModel = useModel('caulacbo');
	const [form] = Form.useForm();

	useEffect(() => {
        caulacboModel.getModel();
    }, []);

	useEffect(() => {
		if (visibleForm && record?._id) {
			form.setFieldsValue({
				...record,
			});
		} else if (visibleForm) {
			form.resetFields();
		}
	}, [visibleForm, record]);

	const onFinish = (values: any) => {
		if (edit) {
			putModel(record._id, values);
		} else {
			postModel(values);
		}
	};

	let title = 'Thêm mới Đơn đăng ký';
	if (edit) title = 'Chỉnh sửa Đơn đăng ký';
	if (isView) title = 'Chi tiết Đơn đăng ký';

	return (
		<Modal
			title={title}
			visible={visibleForm}
			onCancel={() => setVisibleForm(false)}
			onOk={() => {
				form.submit();
			}}
			confirmLoading={formSubmiting}
			destroyOnClose
			width={700}
			okText='Lưu'
            okButtonProps={{ disabled: isView, style: isView ? { display: 'none' } : {} }}
			cancelButtonProps={isView ? { style: { display: 'none' } } : {}}
		>
			<Form form={form} layout='vertical' onFinish={onFinish} disabled={isView}>
				<Form.Item label='Họ và tên' name='hoTen' rules={[...rules.required, ...rules.text, ...rules.length(100)]}>
					<Input placeholder='Nhập họ và tên' />
				</Form.Item>
				
				<Form.Item label='Email' name='email' rules={[...rules.required, ...rules.email]}>
					<Input placeholder='Nhập email' />
				</Form.Item>
				
				<Form.Item label='Số điện thoại' name='soDienThoai' rules={[...rules.required, ...rules.soDienThoai]}>
					<Input placeholder='Nhập số điện thoại' />
				</Form.Item>
				
				<Form.Item label='Giới tính' name='gioiTinh' rules={[...rules.required]}>
					<Select placeholder='Chọn giới tính'>
						<Select.Option value='Nam'>Nam</Select.Option>
						<Select.Option value='Nữ'>Nữ</Select.Option>
						<Select.Option value='Khác'>Khác</Select.Option>
					</Select>
				</Form.Item>
				
				<Form.Item label='Địa chỉ' name='diaChi' rules={[...rules.required]}>
					<Input placeholder='Nhập địa chỉ' />
				</Form.Item>
				
				<Form.Item label='Sở trường' name='soTruong' rules={[...rules.required]}>
					<Input.TextArea rows={2} placeholder='Sở trường của bạn là gì?' />
				</Form.Item>
				
				<Form.Item label='Câu lạc bộ muốn tham gia' name='idCauLacBo' rules={[...rules.required]}>
					<Select placeholder='Chọn câu lạc bộ'>
						{caulacboModel.danhSach
							.filter((c: CauLacBoRecord) => c.hoatDong)
							.map((clb: CauLacBoRecord) => (
								<Select.Option key={clb._id} value={clb._id}>{clb.ten}</Select.Option>
							))}
					</Select>
				</Form.Item>
				
				<Form.Item label='Lý do đăng ký' name='lyDoDangKy' rules={[...rules.required]}>
					<Input.TextArea rows={3} placeholder='Vì sao bạn muốn tham gia CLB này?' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default FormDonDangKy;
