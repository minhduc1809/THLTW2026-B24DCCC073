import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Spin, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
	createExercise,
	deleteExerciseById,
	Exercise,
	ExerciseInput,
	getExerciseDifficultyLabel,
	getAllExercises,
	getExerciseDifficultyColor,
	getMuscleGroupColor,
	getMuscleGroupLabel,
	updateExercise,
	Difficulty,
	MuscleGroup,
} from '@/services/storage';

type ExerciseFilterGroup = MuscleGroup | 'All';
type ExerciseFilterDifficulty = Difficulty | 'All';

type ExerciseFormValues = ExerciseInput;

const muscleGroupOptions: ExerciseFilterGroup[] = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
const difficultyOptions: ExerciseFilterDifficulty[] = ['All', 'Easy', 'Medium', 'Hard'];

const ExerciseLibraryPage: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const [groupFilter, setGroupFilter] = useState<ExerciseFilterGroup>('All');
	const [difficultyFilter, setDifficultyFilter] = useState<ExerciseFilterDifficulty>('All');
	const [formVisible, setFormVisible] = useState(false);
	const [detailVisible, setDetailVisible] = useState(false);
	const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
	const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
	const [form] = Form.useForm<ExerciseFormValues>();

	const loadData = () => {
		setLoading(true);
		window.setTimeout(() => {
			setExercises(getAllExercises());
			setLoading(false);
		}, 180);
	};

	useEffect(() => {
		loadData();
	}, []);

	const filteredExercises = useMemo(() => {
		return exercises.filter((exercise) => {
			const keyword = searchValue.trim().toLowerCase();
			const matchesKeyword = !keyword || exercise.name.toLowerCase().includes(keyword) || exercise.description.toLowerCase().includes(keyword);
			const matchesGroup = groupFilter === 'All' || exercise.muscleGroup === groupFilter;
			const matchesDifficulty = difficultyFilter === 'All' || exercise.difficulty === difficultyFilter;
			return matchesKeyword && matchesGroup && matchesDifficulty;
		});
	}, [difficultyFilter, exercises, groupFilter, searchValue]);

	const openCreateModal = () => {
		setEditingExercise(null);
		form.resetFields();
		form.setFieldsValue({
			name: '',
			muscleGroup: 'Chest',
			difficulty: 'Easy',
			description: '',
			instructions: '',
			caloriesPerHour: 300,
		});
		setFormVisible(true);
	};

	const openEditModal = (exercise: Exercise) => {
		setEditingExercise(exercise);
		form.setFieldsValue(exercise);
		setFormVisible(true);
	};

	const openDetailModal = (exercise: Exercise) => {
		setSelectedExercise(exercise);
		setDetailVisible(true);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const payload: ExerciseInput = values;
			if (editingExercise) {
				updateExercise(editingExercise.id, payload);
				message.success('Đã cập nhật bài tập');
			} else {
				createExercise(payload);
				message.success('Đã thêm bài tập');
			}
			setFormVisible(false);
			loadData();
		} catch {
			message.error('Vui lòng kiểm tra lại form');
		}
	};

	const handleDelete = (id: string) => {
		if (deleteExerciseById(id)) {
			message.success('Đã xóa bài tập');
			loadData();
			return;
		}
		message.error('Không thể xóa bài tập');
	};

	return (
		<Spin spinning={loading}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
					<Input.Search allowClear placeholder='Tìm theo tên' style={{ maxWidth: 280 }} onSearch={setSearchValue} onChange={(event) => setSearchValue(event.target.value)} />
					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
						<Select value={groupFilter} style={{ width: 180 }} onChange={(value: ExerciseFilterGroup) => setGroupFilter(value)} options={muscleGroupOptions.map((item) => ({ label: item === 'All' ? 'Tất cả' : getMuscleGroupLabel(item), value: item }))} />
						<Select value={difficultyFilter} style={{ width: 150 }} onChange={(value: ExerciseFilterDifficulty) => setDifficultyFilter(value)} options={difficultyOptions.map((item) => ({ label: item === 'All' ? 'Tất cả' : getExerciseDifficultyLabel(item), value: item }))} />
						<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
							Thêm mới
						</Button>
					</div>
				</div>

				{filteredExercises.length ? (
					<div className='exercise-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
						{filteredExercises.map((exercise) => (
							<Card key={exercise.id} hoverable onClick={() => openDetailModal(exercise)} style={{ cursor: 'pointer' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
									<div>
										<Typography.Title level={5} style={{ margin: 0 }}>
											{exercise.name}
										</Typography.Title>
										<div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
											<Tag color={getExerciseDifficultyColor(exercise.difficulty)}>{getExerciseDifficultyLabel(exercise.difficulty)}</Tag>
											<Tag color={getMuscleGroupColor(exercise.muscleGroup)}>{getMuscleGroupLabel(exercise.muscleGroup)}</Tag>
										</div>
									</div>
								</div>
								<Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 12, marginBottom: 12 }}>
									{exercise.description}
								</Typography.Paragraph>
								<Typography.Text strong>⚡ {exercise.caloriesPerHour} kcal/giờ</Typography.Text>
								<div style={{ display: 'flex', gap: 8, marginTop: 16 }} onClick={(event) => event.stopPropagation()}>
									<Button size='small' onClick={() => openEditModal(exercise)}>
										Sửa
									</Button>
									<Popconfirm title='Xóa bài tập này?' onConfirm={() => handleDelete(exercise.id)}>
										<Button size='small' danger>
											Xóa
										</Button>
									</Popconfirm>
								</div>
							</Card>
						))}
					</div>
				) : (
					<div style={{ padding: 32, textAlign: 'center' }}>Không có bài tập nào phù hợp bộ lọc hiện tại.</div>
				)}

				<Modal title={editingExercise ? 'Sửa bài tập' : 'Thêm bài tập'} visible={formVisible} onCancel={() => setFormVisible(false)} onOk={handleSubmit} destroyOnClose okText={editingExercise ? 'Cập nhật' : 'Tạo mới'}>
					<Form layout='vertical' form={form}>
						<Form.Item label='Tên bài tập' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên bài tập' }]}>
							<Input />
						</Form.Item>
						<Form.Item label='Nhóm cơ' name='muscleGroup' rules={[{ required: true, message: 'Vui lòng chọn nhóm cơ' }]}>
							<Select options={muscleGroupOptions.filter((item): item is MuscleGroup => item !== 'All').map((item) => ({ label: getMuscleGroupLabel(item), value: item }))} />
						</Form.Item>
						<Form.Item label='Độ khó' name='difficulty' rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}>
							<Select options={difficultyOptions.filter((item): item is Difficulty => item !== 'All').map((item) => ({ label: getExerciseDifficultyLabel(item), value: item }))} />
						</Form.Item>
						<Form.Item label='Mô tả' name='description' rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
							<Input.TextArea rows={3} />
						</Form.Item>
						<Form.Item label='Hướng dẫn (mỗi dòng một bước)' name='instructions' rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}>
							<Input.TextArea rows={5} />
						</Form.Item>
						<Form.Item label='Calo/giờ' name='caloriesPerHour' rules={[{ required: true, message: 'Vui lòng nhập calo/giờ' }]}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
					</Form>
				</Modal>

				<Modal visible={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={720} destroyOnClose>
					{selectedExercise ? (
						<div>
							<Typography.Title level={3} style={{ marginBottom: 8 }}>
								{selectedExercise.name}
							</Typography.Title>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
								<Tag color={getExerciseDifficultyColor(selectedExercise.difficulty)}>{getExerciseDifficultyLabel(selectedExercise.difficulty)}</Tag>
								<Tag color={getMuscleGroupColor(selectedExercise.muscleGroup)}>{getMuscleGroupLabel(selectedExercise.muscleGroup)}</Tag>
								<Tag color='processing'>⚡ {selectedExercise.caloriesPerHour} kcal/giờ</Tag>
							</div>
							<Typography.Paragraph>{selectedExercise.description}</Typography.Paragraph>
							<Typography.Title level={5}>Hướng dẫn thực hiện</Typography.Title>
							<ol style={{ paddingLeft: 20 }}>
								{selectedExercise.instructions
									.split(/\r?\n/)
									.map((line) => line.trim())
									.filter((line) => line.length > 0)
									.map((line) => (
										<li key={`${selectedExercise.id}-${line}`}>{line}</li>
									))}
							</ol>
							<div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
								<Tag color='blue'>Nhóm cơ: {getMuscleGroupLabel(selectedExercise.muscleGroup)}</Tag>
								<Tag color='orange'>Độ khó: {getExerciseDifficultyLabel(selectedExercise.difficulty)}</Tag>
								<Tag color='geekblue'>Calo/giờ: {selectedExercise.caloriesPerHour}</Tag>
							</div>
						</div>
					) : null}
				</Modal>
			</div>
		</Spin>
	);
};

export default ExerciseLibraryPage;