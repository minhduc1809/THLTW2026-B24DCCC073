import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Drawer, Form, Input, InputNumber, Popconfirm, Progress, Row, Segmented, Select, Spin, Tag, Typography, message } from 'antd';
import moment, { Moment } from 'moment';
import {
	Goal,
	GoalInput,
	GoalStatus,
	GoalType,
	createGoal,
	deleteGoalById,
	formatDisplayDate,
	getAllGoals,
	getGoalStatusColor,
	getGoalStatusLabel,
	getGoalTypeColor,
	getGoalTypeLabel,
	updateGoal,
} from '@/services/storage';

type GoalFormValues = {
	name: string;
	type: GoalType;
	targetValue: number;
	currentValue: number;
	unit: string;
	deadline: Moment;
	status: GoalStatus;
};

const goalTypeOptions: Array<{ label: string; value: GoalType }> = [
	{ label: 'Giảm cân', value: 'WeightLoss' },
	{ label: 'Tăng cơ', value: 'MuscleGain' },
	{ label: 'Cải thiện sức bền', value: 'Endurance' },
	{ label: 'Khác', value: 'Other' },
];

const goalStatusOptions: Array<{ label: string; value: GoalStatus }> = [
	{ label: 'Đang thực hiện', value: 'active' },
	{ label: 'Đã đạt', value: 'achieved' },
	{ label: 'Đã hủy', value: 'cancelled' },
];

const GoalsPage: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [statusFilter, setStatusFilter] = useState<'Tất cả' | GoalStatus>('Tất cả');
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
	const [form] = Form.useForm<GoalFormValues>();

	const loadData = () => {
		setLoading(true);
		window.setTimeout(() => {
			setGoals(getAllGoals());
			setLoading(false);
		}, 180);
	};

	useEffect(() => {
		loadData();
	}, []);

	const filteredGoals = useMemo(() => goals.filter((goal) => statusFilter === 'Tất cả' || goal.status === statusFilter), [goals, statusFilter]);

	const openCreateDrawer = () => {
		setEditingGoal(null);
		form.resetFields();
		form.setFieldsValue({
			name: '',
			type: 'WeightLoss',
			targetValue: 5,
			currentValue: 0,
			unit: 'kg',
			deadline: moment().add(30, 'day'),
			status: 'active',
		});
		setDrawerOpen(true);
	};

	const openEditDrawer = (goal: Goal) => {
		setEditingGoal(goal);
		form.setFieldsValue({
			name: goal.name,
			type: goal.type,
			targetValue: goal.targetValue,
			currentValue: goal.currentValue,
			unit: goal.unit,
			deadline: moment(goal.deadline),
			status: goal.status,
		});
		setDrawerOpen(true);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const payload: GoalInput = {
				name: values.name,
				type: values.type,
				targetValue: values.targetValue,
				currentValue: values.currentValue,
				unit: values.unit,
				deadline: values.deadline.toISOString(),
				status: values.status,
			};

			if (editingGoal) {
				updateGoal(editingGoal.id, payload);
				message.success('Đã cập nhật mục tiêu');
			} else {
				createGoal(payload);
				message.success('Đã thêm mục tiêu');
			}
			setDrawerOpen(false);
			loadData();
		} catch {
			message.error('Vui lòng kiểm tra lại form');
		}
	};

	const handleInlineUpdate = (goal: Goal, value: number | null) => {
		if (typeof value !== 'number') {
			return;
		}
		updateGoal(goal.id, { currentValue: value });
		message.success('Đã cập nhật tiến độ');
		loadData();
	};

	const handleDelete = (id: string) => {
		if (deleteGoalById(id)) {
			message.success('Đã xóa mục tiêu');
			loadData();
			return;
		}
		message.error('Không thể xóa mục tiêu');
	};

	return (
		<Spin spinning={loading}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
					<Segmented
						value={statusFilter}
						onChange={(value) => setStatusFilter(value as 'Tất cả' | GoalStatus)}
						options={['Tất cả', 'active', 'achieved', 'cancelled'].map((item) => ({
							label: item === 'Tất cả' ? 'Tất cả' : item === 'active' ? 'Đang thực hiện' : item === 'achieved' ? 'Đã đạt' : 'Đã hủy',
							value: item,
						}))}
					/>
					<Button type='primary' onClick={openCreateDrawer}>
						Thêm mới
					</Button>
				</div>

				{filteredGoals.length ? (
					<Row gutter={[16, 16]}>
						{filteredGoals.map((goal) => {
							const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
							return (
								<Col key={goal.id} xs={24} sm={12} lg={8}>
									<Card title={null} style={{ height: '100%' }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
											<div>
												<Typography.Title level={5} style={{ margin: 0 }}>
													{goal.name}
												</Typography.Title>
												<Tag color={getGoalTypeColor(goal.type)} style={{ marginTop: 8 }}>
													{getGoalTypeLabel(goal.type)}
												</Tag>
											</div>
											<Tag color={getGoalStatusColor(goal.status)}>{getGoalStatusLabel(goal.status)}</Tag>
										</div>

										<Progress percent={Math.round(percent)} status={goal.status === 'achieved' ? 'success' : goal.status === 'cancelled' ? 'exception' : 'active'} style={{ marginTop: 16 }} />

										<div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
											<div>
												<Typography.Text type='secondary'>Tiến độ hiện tại</Typography.Text>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
													<InputNumber min={0} value={goal.currentValue} onChange={(value) => handleInlineUpdate(goal, value)} style={{ width: 120 }} />
													<Typography.Text>
														/ {goal.targetValue} {goal.unit}
													</Typography.Text>
												</div>
											</div>
											<Typography.Text>Deadline: {formatDisplayDate(goal.deadline)}</Typography.Text>
											<Typography.Text>Trạng thái: {getGoalStatusLabel(goal.status)}</Typography.Text>
										</div>

										<div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
											<Button onClick={() => openEditDrawer(goal)}>Sửa</Button>
											<Popconfirm title='Xóa mục tiêu này?' onConfirm={() => handleDelete(goal.id)}>
												<Button danger>Xóa</Button>
											</Popconfirm>
										</div>
									</Card>
								</Col>
							);
						})}
					</Row>
				) : (
					<div style={{ padding: 32, textAlign: 'center' }}>Không có mục tiêu nào phù hợp bộ lọc hiện tại.</div>
				)}

				<Drawer
					title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu'}
					visible={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					width={480}
					destroyOnClose
					extra={<Button type='primary' onClick={handleSubmit}>{editingGoal ? 'Cập nhật' : 'Tạo mới'}</Button>}
				>
					<Form layout='vertical' form={form}>
						<Form.Item label='Tên mục tiêu' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}>
							<Input />
						</Form.Item>
						<Form.Item label='Loại mục tiêu' name='type' rules={[{ required: true, message: 'Vui lòng chọn loại mục tiêu' }]}>
							<Select options={goalTypeOptions} />
						</Form.Item>
						<Form.Item label='Giá trị mục tiêu' name='targetValue' rules={[{ required: true, message: 'Vui lòng nhập giá trị mục tiêu' }]}>
							<InputNumber min={1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Giá trị hiện tại' name='currentValue' rules={[{ required: true, message: 'Vui lòng nhập giá trị hiện tại' }]}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Đơn vị' name='unit' rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}>
							<Input placeholder='kg, km, phút...' />
						</Form.Item>
						<Form.Item label='Deadline' name='deadline' rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}>
							<DatePicker style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Trạng thái' name='status' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
							<Select options={goalStatusOptions} />
						</Form.Item>
					</Form>
				</Drawer>
			</div>
		</Spin>
	);
};

export default GoalsPage;