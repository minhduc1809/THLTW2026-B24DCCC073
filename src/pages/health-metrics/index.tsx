import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, InputNumber, Modal, Popconfirm, Spin, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import moment, { Moment } from 'moment';
import dayjs from 'dayjs';
import {
	HealthMetric,
	HealthMetricInput,
	calculateBmi,
	createHealthMetric,
	deleteHealthMetricById,
	formatDisplayDate,
	getAllHealthMetrics,
	getBmiTagColor,
	updateHealthMetric,
} from '@/services/storage';

type HealthFormValues = {
	date: Moment;
	weight: number;
	height: number;
	restingHeartRate: number;
	sleepHours: number;
};

type FlexProps = {
	justify?: React.CSSProperties['justifyContent'];
	align?: React.CSSProperties['alignItems'];
	gap?: React.CSSProperties['gap'];
	style?: React.CSSProperties;
	children: React.ReactNode;
};

const Flex: React.FC<FlexProps> = ({ justify, align, gap, style, children }) => (
	<div
		style={{
			display: 'flex',
			justifyContent: justify,
			alignItems: align,
			gap,
			...style,
		}}
	>
		{children}
	</div>
);

const HealthMetricsPage: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [metrics, setMetrics] = useState<HealthMetric[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<HealthMetric | null>(null);
	const [form] = Form.useForm<HealthFormValues>();

	const loadData = () => {
		setLoading(true);
		window.setTimeout(() => {
			setMetrics(getAllHealthMetrics());
			setLoading(false);
		}, 180);
	};

	useEffect(() => {
		loadData();
	}, []);

	const metricsSorted = useMemo(() => [...metrics].sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf()), [metrics]);

	const openCreateModal = () => {
		setEditingRecord(null);
		form.resetFields();
		form.setFieldsValue({ date: moment(), weight: 70, height: 170, restingHeartRate: 65, sleepHours: 7 });
		setIsModalOpen(true);
	};

	const openEditModal = (record: HealthMetric) => {
		setEditingRecord(record);
		form.setFieldsValue({
			date: moment(record.date),
			weight: record.weight,
			height: record.height,
			restingHeartRate: record.restingHeartRate,
			sleepHours: record.sleepHours,
		});
		setIsModalOpen(true);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const payload: HealthMetricInput = {
				date: values.date.toISOString(),
				weight: values.weight,
				height: values.height,
				restingHeartRate: values.restingHeartRate,
				sleepHours: values.sleepHours,
			};

			if (editingRecord) {
				updateHealthMetric(editingRecord.id, payload);
				message.success('Đã cập nhật chỉ số sức khỏe');
			} else {
				createHealthMetric(payload);
				message.success('Đã thêm chỉ số sức khỏe');
			}
			setIsModalOpen(false);
			loadData();
		} catch {
			message.error('Vui lòng kiểm tra lại form');
		}
	};

	const handleDelete = (id: string) => {
		if (deleteHealthMetricById(id)) {
			message.success('Đã xóa chỉ số sức khỏe');
			loadData();
			return;
		}
		message.error('Không thể xóa chỉ số sức khỏe');
	};

	const columns: ColumnsType<HealthMetric> = [
		{ title: 'Ngày', dataIndex: 'date', key: 'date', render: (value: string) => formatDisplayDate(value) },
		{ title: 'Cân nặng', dataIndex: 'weight', key: 'weight', render: (value: number) => `${value} kg` },
		{ title: 'Chiều cao', dataIndex: 'height', key: 'height', render: (value: number) => `${value} cm` },
		{
			title: 'BMI',
			dataIndex: 'bmi',
			key: 'bmi',
			render: (value: number) => <Tag color={getBmiTagColor(value)}>{value.toFixed(1)}</Tag>,
		},
		{ title: 'Nhịp tim', dataIndex: 'restingHeartRate', key: 'restingHeartRate', render: (value: number) => `${value} bpm` },
		{ title: 'Giờ ngủ', dataIndex: 'sleepHours', key: 'sleepHours', render: (value: number) => `${value} giờ` },
		{
			title: 'Hành động',
			key: 'actions',
			render: (_, record) => (
				<div style={{ display: 'flex', gap: 8 }}>
					<Button size='small' onClick={() => openEditModal(record)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa chỉ số sức khỏe này?' onConfirm={() => handleDelete(record.id)}>
						<Button danger size='small'>
							Xóa
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<Spin spinning={loading}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<Flex justify='space-between' align='center' style={{ flexWrap: 'wrap', rowGap: 12, columnGap: 12 }}>
					<div />
					<Flex align='center' gap={8} style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
						<Space size={8} wrap>
							<Tag color='blue'>🔵 Thiếu cân &lt; 18.5</Tag>
							<Tag color='green'>🟢 Bình thường 18.5–24.9</Tag>
							<Tag color='gold'>🟡 Thừa cân 25–29.9</Tag>
							<Tag color='red'>🔴 Béo phì ≥ 30</Tag>
						</Space>
						<Button type='primary' onClick={openCreateModal}>
							Thêm mới
						</Button>
					</Flex>
				</Flex>
				<Table<HealthMetric> rowKey='id' columns={columns} dataSource={metricsSorted} pagination={{ pageSize: 8 }} locale={{ emptyText: 'Không có dữ liệu chỉ số sức khỏe' }} />

				<Modal title={editingRecord ? 'Sửa chỉ số sức khỏe' : 'Thêm chỉ số sức khỏe'} visible={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmit} destroyOnClose okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}>
					<Form layout='vertical' form={form}>
						<Form.Item label='Ngày' name='date' rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
							<DatePicker style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Cân nặng (kg)' name='weight' rules={[{ required: true, message: 'Vui lòng nhập cân nặng' }]}>
							<InputNumber min={1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Chiều cao (cm)' name='height' rules={[{ required: true, message: 'Vui lòng nhập chiều cao' }]}>
							<InputNumber min={1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item noStyle shouldUpdate={(previousValues, currentValues) => previousValues.weight !== currentValues.weight || previousValues.height !== currentValues.height}>
							{() => {
								const weight = form.getFieldValue('weight');
								const height = form.getFieldValue('height');
								const bmi = typeof weight === 'number' && typeof height === 'number' ? calculateBmi(weight, height) : 0;
								return <div style={{ marginBottom: 16 }}>BMI dự kiến: <Tag color={getBmiTagColor(bmi)}>{bmi ? bmi.toFixed(1) : '0.0'}</Tag></div>;
							}}
						</Form.Item>
						<Form.Item label='Nhịp tim nghỉ (bpm)' name='restingHeartRate' rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}>
							<InputNumber min={1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Giờ ngủ' name='sleepHours' rules={[{ required: true, message: 'Vui lòng nhập giờ ngủ' }]}>
							<InputNumber min={0} step={0.1} style={{ width: '100%' }} />
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</Spin>
	);
};

export default HealthMetricsPage;