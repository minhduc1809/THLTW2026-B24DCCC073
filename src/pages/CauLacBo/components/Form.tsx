import { DatePicker, Form, Input, Modal, Switch } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import rules from '@/utils/rules';
import UploadFile from '@/components/Upload/UploadFile';
import TinyEditor from '@/components/TinyEditor';

const FormCauLacBo: React.FC = () => {
	const { visibleForm, setVisibleForm, edit, record, postModel, putModel, formSubmiting } = useModel('caulacbo');
	const [form] = Form.useForm();

	useEffect(() => {
		if (visibleForm && record?._id) {
			form.setFieldsValue({
				...record,
				ngayThanhLap: record.ngayThanhLap ? moment(record.ngayThanhLap) : undefined,
				avatar: record.avatar ? [{ url: record.avatar, name: 'avatar.png' }] : [],
			});
		} else if (visibleForm) {
			form.resetFields();
		}
	}, [visibleForm, record]);

	const onFinish = async (values: any) => {
        let avatarStr = '';
        if (values.avatar) {
            const list = values.avatar.fileList || values.avatar;
            if (Array.isArray(list) && list.length > 0) {
                const fileItem = list[0];
                if (fileItem.url) {
                    avatarStr = fileItem.url;
                } else if (fileItem.preview) {
                    avatarStr = fileItem.preview;
                } else if (fileItem.originFileObj) {
                    avatarStr = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(fileItem.originFileObj);
                        reader.onload = () => resolve(reader.result as string);
                    });
                }
            }
        }

		const payload = {
			...values,
			ngayThanhLap: values.ngayThanhLap ? values.ngayThanhLap.toISOString() : undefined,
			avatar: avatarStr,
		};

		if (edit) {
			putModel(record._id, payload);
		} else {
			postModel(payload);
		}
	};

	return (
		<Modal
			title={edit ? 'Chỉnh sửa Câu lạc bộ' : 'Thêm mới Câu lạc bộ'}
			visible={visibleForm}
			onCancel={() => setVisibleForm(false)}
			onOk={() => form.submit()}
			confirmLoading={formSubmiting}
			destroyOnClose
			width={800}
		>
			<Form form={form} layout='vertical' onFinish={onFinish} initialValues={{ hoatDong: true }}>
				<Form.Item label='Ảnh đại diện' name='avatar'>
					<UploadFile isAvatarSmall />
				</Form.Item>
				
				<Form.Item label='Tên câu lạc bộ' name='ten' rules={[...rules.required, ...rules.text, ...rules.length(100)]}>
					<Input placeholder='Nhập tên câu lạc bộ' />
				</Form.Item>
				
				<Form.Item label='Mô tả' name='moTa' rules={[...rules.requiredHtml]}>
					<TinyEditor />
				</Form.Item>
				
				<Form.Item label='Chủ nhiệm CLB' name='chuNhiem' rules={[...rules.required, ...rules.text, ...rules.length(50)]}>
					<Input placeholder='Nhập họ tên chủ nhiệm' />
				</Form.Item>
				
				<Form.Item label='Ngày thành lập' name='ngayThanhLap' rules={[...rules.required]}>
					<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
				</Form.Item>
				
				<Form.Item label='Trạng thái hoạt động' name='hoatDong' valuePropName='checked'>
					<Switch checkedChildren='Hoạt động' unCheckedChildren='Không' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default FormCauLacBo;
