import { type Task, type TaskPriority, type TaskStatus } from '@/services/storage';
import rules from '@/utils/rules';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';

export type TaskFormValues = {
	name: string;
	description: string;
	deadline: Dayjs;
	priority: TaskPriority;
	tags: string[];
	status: TaskStatus;
};

type TaskFormModalProps = {
	open: boolean;
	mode: 'create' | 'edit';
	initialValues?: Task;
	defaultStatus?: TaskStatus;
	confirmLoading?: boolean;
	onCancel: () => void;
	onSubmit: (values: TaskFormValues) => void;
};

const priorityOptions: { label: string; value: TaskPriority }[] = [
	{ label: 'Cao', value: 'High' },
	{ label: 'Trung bình', value: 'Medium' },
	{ label: 'Thấp', value: 'Low' },
];

const statusOptions: { label: string; value: TaskStatus }[] = [
	{ label: 'Cần làm', value: 'todo' },
	{ label: 'Đang làm', value: 'inprogress' },
	{ label: 'Hoàn thành', value: 'done' },
];

const TaskFormModal = (props: TaskFormModalProps) => {
	const { open, mode, initialValues, defaultStatus, confirmLoading, onCancel, onSubmit } = props;
	const [form] = Form.useForm<TaskFormValues>();

	useEffect(() => {
		if (!open) {
			form.resetFields();
			return;
		}

		if (initialValues) {
			form.setFieldsValue({
				name: initialValues.name,
				description: initialValues.description,
				deadline: dayjs(initialValues.deadline),
				priority: initialValues.priority,
				tags: initialValues.tags,
				status: initialValues.status,
			});
			return;
		}

		form.setFieldsValue({
			name: '',
			description: '',
			priority: 'Medium',
			tags: [],
			status: defaultStatus ?? 'todo',
		});
	}, [open, initialValues, defaultStatus, form]);

	return (
		<Modal
			visible={open}
			title={mode === 'create' ? 'Thêm task' : 'Chỉnh sửa task'}
			onCancel={onCancel}
			okText={mode === 'create' ? 'Tạo task' : 'Lưu thay đổi'}
			confirmLoading={confirmLoading}
			onOk={() => {
				form
					.validateFields()
					.then((values) => {
						onSubmit(values);
					})
					.catch(() => undefined);
			}}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Form.Item label='Tên task' name='name' rules={rules.required}>
					<Input placeholder='Nhập tên task' />
				</Form.Item>
				<Form.Item label='Mô tả' name='description' rules={rules.text}>
					<Input.TextArea rows={4} placeholder='Nhập mô tả' />
				</Form.Item>
				<Form.Item label='Deadline' name='deadline' rules={rules.required}>
					<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
				</Form.Item>
				<Form.Item label='Mức độ ưu tiên' name='priority' rules={rules.required}>
					<Select options={priorityOptions} placeholder='Chọn mức độ ưu tiên' />
				</Form.Item>
				<Form.Item label='Tags' name='tags'>
					<Select mode='tags' placeholder='Nhập tag và nhấn Enter' />
				</Form.Item>
				<Form.Item label='Trạng thái' name='status' rules={rules.required}>
					<Select options={statusOptions} placeholder='Chọn trạng thái' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default TaskFormModal;
