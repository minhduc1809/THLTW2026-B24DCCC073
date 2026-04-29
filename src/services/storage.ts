import dayjs from 'dayjs';

export type WorkoutExerciseType = 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
export type WorkoutStatus = 'completed' | 'missed';
export type GoalType = 'WeightLoss' | 'MuscleGain' | 'Endurance' | 'Other';
export type GoalStatus = 'active' | 'achieved' | 'cancelled';
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface WorkoutSession {
	id: string;
	date: string;
	exerciseType: WorkoutExerciseType;
	duration: number;
	calories: number;
	note: string;
	status: WorkoutStatus;
	createdAt: string;
}

export interface HealthMetric {
	id: string;
	date: string;
	weight: number;
	height: number;
	bmi: number;
	restingHeartRate: number;
	sleepHours: number;
	createdAt: string;
}

export interface Goal {
	id: string;
	name: string;
	type: GoalType;
	targetValue: number;
	currentValue: number;
	unit: string;
	deadline: string;
	status: GoalStatus;
	createdAt: string;
}

export interface Exercise {
	id: string;
	name: string;
	muscleGroup: MuscleGroup;
	difficulty: Difficulty;
	description: string;
	instructions: string;
	caloriesPerHour: number;
	createdAt: string;
}

export type WorkoutSessionInput = Omit<WorkoutSession, 'id' | 'createdAt'>;
export type HealthMetricInput = Omit<HealthMetric, 'id' | 'createdAt' | 'bmi'>;
export type GoalInput = Omit<Goal, 'id' | 'createdAt'>;
export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt'>;

const WORKOUTS_KEY = 'fitness_app_workouts';
const HEALTH_METRICS_KEY = 'fitness_app_health_metrics';
const GOALS_KEY = 'fitness_app_goals';
const EXERCISES_KEY = 'fitness_app_exercises';

type StoreKey = typeof WORKOUTS_KEY | typeof HEALTH_METRICS_KEY | typeof GOALS_KEY | typeof EXERCISES_KEY;

const hasWindow = () => typeof window !== 'undefined' && !!window.localStorage;

const createId = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readList = <T,>(key: StoreKey): T[] => {
	if (!hasWindow()) {
		return [];
	}
	const rawValue = window.localStorage.getItem(key);
	if (!rawValue) {
		return [];
	}
	try {
		const parsed: unknown = JSON.parse(rawValue);
		return Array.isArray(parsed) ? (parsed as T[]) : [];
	} catch {
		return [];
	}
};

const writeList = <T,>(key: StoreKey, value: T[]): void => {
	if (!hasWindow()) {
		return;
	}
	window.localStorage.setItem(key, JSON.stringify(value));
};

const updateList = <T extends { id: string }>(key: StoreKey, updater: (items: T[]) => T[]): T[] => {
	const nextItems = updater(readList<T>(key));
	writeList(key, nextItems);
	return nextItems;
};

export const formatDisplayDate = (value: string) => dayjs(value).format('DD/MM/YYYY');

export const calculateBmi = (weight: number, height: number) => {
	if (!height) {
		return 0;
	}
	return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
};

export const getBmiTagColor = (bmi: number) => {
	if (bmi < 18.5) return 'blue';
	if (bmi < 25) return 'green';
	if (bmi < 30) return 'gold';
	return 'red';
};

export const getWorkoutTypeColor = (type: WorkoutExerciseType) => {
	const colorMap: Record<WorkoutExerciseType, string> = {
		Cardio: 'blue',
		Strength: 'volcano',
		Yoga: 'purple',
		HIIT: 'red',
		Other: 'default',
	};
	return colorMap[type];
};

export const getWorkoutTypeLabel = (type: WorkoutExerciseType) => {
	const labelMap: Record<WorkoutExerciseType, string> = {
		Cardio: 'Tim mạch',
		Strength: 'Sức mạnh',
		Yoga: 'Yoga',
		HIIT: 'Cường độ cao',
		Other: 'Khác',
	};
	return labelMap[type];
};

export const getWorkoutStatusColor = (status: WorkoutStatus) => (status === 'completed' ? 'green' : 'red');

export const getGoalTypeColor = (type: GoalType) => {
	const colorMap: Record<GoalType, string> = {
		WeightLoss: 'geekblue',
		MuscleGain: 'orange',
		Endurance: 'cyan',
		Other: 'default',
	};
	return colorMap[type];
};

export const getGoalTypeLabel = (type: GoalType) => {
	const labelMap: Record<GoalType, string> = {
		WeightLoss: 'Giảm cân',
		MuscleGain: 'Tăng cơ',
		Endurance: 'Cải thiện sức bền',
		Other: 'Khác',
	};
	return labelMap[type];
};

export const getGoalStatusColor = (status: GoalStatus) => {
	const colorMap: Record<GoalStatus, string> = {
		active: 'processing',
		achieved: 'success',
		cancelled: 'error',
	};
	return colorMap[status];
};

export const getGoalStatusLabel = (status: GoalStatus) => {
	const labelMap: Record<GoalStatus, string> = {
		active: 'Đang thực hiện',
		achieved: 'Đã đạt',
		cancelled: 'Đã hủy',
	};
	return labelMap[status];
};

export const getExerciseDifficultyColor = (difficulty: Difficulty) => {
	const colorMap: Record<Difficulty, string> = {
		Easy: 'green',
		Medium: 'orange',
		Hard: 'red',
	};
	return colorMap[difficulty];
};

export const getExerciseDifficultyLabel = (difficulty: Difficulty) => {
	const labelMap: Record<Difficulty, string> = {
		Easy: 'Dễ',
		Medium: 'Trung bình',
		Hard: 'Khó',
	};
	return labelMap[difficulty];
};

export const getMuscleGroupColor = (muscleGroup: MuscleGroup) => {
	const colorMap: Record<MuscleGroup, string> = {
		Chest: 'blue',
		Back: 'blue',
		Legs: 'blue',
		Shoulders: 'blue',
		Arms: 'blue',
		Core: 'blue',
		'Full Body': 'blue',
	};
	return colorMap[muscleGroup];
};

export const getMuscleGroupLabel = (muscleGroup: MuscleGroup) => {
	const labelMap: Record<MuscleGroup, string> = {
		Chest: 'Ngực',
		Back: 'Lưng',
		Legs: 'Chân',
		Shoulders: 'Vai',
		Arms: 'Tay',
		Core: 'Core',
		'Full Body': 'Toàn thân',
	};
	return labelMap[muscleGroup];
};

const buildWorkoutSession = (input: WorkoutSessionInput, id = createId()): WorkoutSession => ({
	id,
	...input,
	createdAt: dayjs().toISOString(),
});

export const getAllWorkoutSessions = (): WorkoutSession[] => readList<WorkoutSession>(WORKOUTS_KEY);

export const getWorkoutSessionById = (id: string): WorkoutSession | undefined =>
	getAllWorkoutSessions().find((item) => item.id === id);

export const createWorkoutSession = (input: WorkoutSessionInput): WorkoutSession => {
	const record = buildWorkoutSession(input);
	updateList<WorkoutSession>(WORKOUTS_KEY, (items) => [record, ...items]);
	return record;
};

export const updateWorkoutSession = (id: string, input: Partial<WorkoutSessionInput>): WorkoutSession | undefined => {
	let updatedRecord: WorkoutSession | undefined;
	updateList<WorkoutSession>(WORKOUTS_KEY, (items) =>
		items.map((item) => {
			if (item.id !== id) {
				return item;
			}
			updatedRecord = { ...item, ...input };
			return updatedRecord;
		}),
	);
	return updatedRecord;
};

export const deleteWorkoutSessionById = (id: string): boolean => {
	const beforeLength = getAllWorkoutSessions().length;
	updateList<WorkoutSession>(WORKOUTS_KEY, (items) => items.filter((item) => item.id !== id));
	return getAllWorkoutSessions().length < beforeLength;
};

const buildHealthMetric = (input: HealthMetricInput, id = createId()): HealthMetric => ({
	id,
	...input,
	bmi: calculateBmi(input.weight, input.height),
	createdAt: dayjs().toISOString(),
});

export const getAllHealthMetrics = (): HealthMetric[] => readList<HealthMetric>(HEALTH_METRICS_KEY);

export const getHealthMetricById = (id: string): HealthMetric | undefined =>
	getAllHealthMetrics().find((item) => item.id === id);

export const createHealthMetric = (input: HealthMetricInput): HealthMetric => {
	const record = buildHealthMetric(input);
	updateList<HealthMetric>(HEALTH_METRICS_KEY, (items) => [record, ...items]);
	return record;
};

export const updateHealthMetric = (id: string, input: Partial<HealthMetricInput>): HealthMetric | undefined => {
	let updatedRecord: HealthMetric | undefined;
	updateList<HealthMetric>(HEALTH_METRICS_KEY, (items) =>
		items.map((item) => {
			if (item.id !== id) {
				return item;
			}
			const merged = { ...item, ...input };
			updatedRecord = {
				...merged,
				bmi: calculateBmi(merged.weight, merged.height),
			};
			return updatedRecord;
		}),
	);
	return updatedRecord;
};

export const deleteHealthMetricById = (id: string): boolean => {
	const beforeLength = getAllHealthMetrics().length;
	updateList<HealthMetric>(HEALTH_METRICS_KEY, (items) => items.filter((item) => item.id !== id));
	return getAllHealthMetrics().length < beforeLength;
};

const buildGoal = (input: GoalInput, id = createId()): Goal => ({
	id,
	...input,
	createdAt: dayjs().toISOString(),
});

export const getAllGoals = (): Goal[] => readList<Goal>(GOALS_KEY);

export const getGoalById = (id: string): Goal | undefined => getAllGoals().find((item) => item.id === id);

export const createGoal = (input: GoalInput): Goal => {
	const record = buildGoal(input);
	updateList<Goal>(GOALS_KEY, (items) => [record, ...items]);
	return record;
};

export const updateGoal = (id: string, input: Partial<GoalInput>): Goal | undefined => {
	let updatedRecord: Goal | undefined;
	updateList<Goal>(GOALS_KEY, (items) =>
		items.map((item) => {
			if (item.id !== id) {
				return item;
			}
			updatedRecord = { ...item, ...input };
			return updatedRecord;
		}),
	);
	return updatedRecord;
};

export const deleteGoalById = (id: string): boolean => {
	const beforeLength = getAllGoals().length;
	updateList<Goal>(GOALS_KEY, (items) => items.filter((item) => item.id !== id));
	return getAllGoals().length < beforeLength;
};

const buildExercise = (input: ExerciseInput, id = createId()): Exercise => ({
	id,
	...input,
	createdAt: dayjs().toISOString(),
});

export const getAllExercises = (): Exercise[] => readList<Exercise>(EXERCISES_KEY);

export const getExerciseById = (id: string): Exercise | undefined => getAllExercises().find((item) => item.id === id);

export const createExercise = (input: ExerciseInput): Exercise => {
	const record = buildExercise(input);
	updateList<Exercise>(EXERCISES_KEY, (items) => [record, ...items]);
	return record;
};

export const updateExercise = (id: string, input: Partial<ExerciseInput>): Exercise | undefined => {
	let updatedRecord: Exercise | undefined;
	updateList<Exercise>(EXERCISES_KEY, (items) =>
		items.map((item) => {
			if (item.id !== id) {
				return item;
			}
			updatedRecord = { ...item, ...input };
			return updatedRecord;
		}),
	);
	return updatedRecord;
};

export const deleteExerciseById = (id: string): boolean => {
	const beforeLength = getAllExercises().length;
	updateList<Exercise>(EXERCISES_KEY, (items) => items.filter((item) => item.id !== id));
	return getAllExercises().length < beforeLength;
};

const sampleWorkouts: WorkoutSession[] = [
	{
		id: 'seed-workout-1',
		date: dayjs().subtract(0, 'day').hour(7).minute(0).second(0).millisecond(0).toISOString(),
		exerciseType: 'Cardio',
		duration: 35,
		calories: 310,
		note: 'Chạy bộ buổi sáng quanh công viên',
		status: 'completed',
		createdAt: dayjs().subtract(0, 'day').toISOString(),
	},
	{
		id: 'seed-workout-2',
		date: dayjs().subtract(1, 'day').hour(18).minute(30).second(0).millisecond(0).toISOString(),
		exerciseType: 'Strength',
		duration: 50,
		calories: 420,
		note: 'Tập ngực và tay sau',
		status: 'completed',
		createdAt: dayjs().subtract(1, 'day').toISOString(),
	},
	{
		id: 'seed-workout-3',
		date: dayjs().subtract(2, 'day').hour(19).minute(0).second(0).millisecond(0).toISOString(),
		exerciseType: 'Yoga',
		duration: 40,
		calories: 180,
		note: 'Giãn cơ và phục hồi',
		status: 'missed',
		createdAt: dayjs().subtract(2, 'day').toISOString(),
	},
	{
		id: 'seed-workout-4',
		date: dayjs().subtract(3, 'day').hour(6).minute(45).second(0).millisecond(0).toISOString(),
		exerciseType: 'HIIT',
		duration: 22,
		calories: 260,
		note: 'Bài tập cường độ cao 20 phút',
		status: 'completed',
		createdAt: dayjs().subtract(3, 'day').toISOString(),
	},
	{
		id: 'seed-workout-5',
		date: dayjs().subtract(5, 'day').hour(17).minute(15).second(0).millisecond(0).toISOString(),
		exerciseType: 'Strength',
		duration: 60,
		calories: 480,
		note: 'Chân và core',
		status: 'completed',
		createdAt: dayjs().subtract(5, 'day').toISOString(),
	},
	{
		id: 'seed-workout-6',
		date: dayjs().subtract(7, 'day').hour(7).minute(20).second(0).millisecond(0).toISOString(),
		exerciseType: 'Cardio',
		duration: 30,
		calories: 280,
		note: 'Đạp xe ngoài trời',
		status: 'completed',
		createdAt: dayjs().subtract(7, 'day').toISOString(),
	},
	{
		id: 'seed-workout-7',
		date: dayjs().subtract(10, 'day').hour(18).minute(0).second(0).millisecond(0).toISOString(),
		exerciseType: 'Other',
		duration: 25,
		calories: 140,
		note: 'Đi bộ thư giãn',
		status: 'completed',
		createdAt: dayjs().subtract(10, 'day').toISOString(),
	},
	{
		id: 'seed-workout-8',
		date: dayjs().subtract(14, 'day').hour(6).minute(50).second(0).millisecond(0).toISOString(),
		exerciseType: 'Yoga',
		duration: 45,
		calories: 190,
		note: 'Yoga buổi sáng',
		status: 'completed',
		createdAt: dayjs().subtract(14, 'day').toISOString(),
	},
	{
		id: 'seed-workout-9',
		date: dayjs().subtract(17, 'day').hour(18).minute(15).second(0).millisecond(0).toISOString(),
		exerciseType: 'Strength',
		duration: 55,
		calories: 450,
		note: 'Tập vai và lưng',
		status: 'completed',
		createdAt: dayjs().subtract(17, 'day').toISOString(),
	},
	{
		id: 'seed-workout-10',
		date: dayjs().subtract(23, 'day').hour(7).minute(10).second(0).millisecond(0).toISOString(),
		exerciseType: 'HIIT',
		duration: 18,
		calories: 230,
		note: 'Tabata toàn thân',
		status: 'missed',
		createdAt: dayjs().subtract(23, 'day').toISOString(),
	},
];

const sampleHealthMetrics: HealthMetric[] = [
	{ id: 'seed-health-1', date: dayjs().subtract(0, 'day').toISOString(), weight: 50, height: 170, bmi: calculateBmi(50, 170), restingHeartRate: 72, sleepHours: 6.5, createdAt: dayjs().subtract(0, 'day').toISOString() },
	{ id: 'seed-health-2', date: dayjs().subtract(3, 'day').toISOString(), weight: 58, height: 170, bmi: calculateBmi(58, 170), restingHeartRate: 66, sleepHours: 7.3, createdAt: dayjs().subtract(3, 'day').toISOString() },
	{ id: 'seed-health-3', date: dayjs().subtract(6, 'day').toISOString(), weight: 68, height: 170, bmi: calculateBmi(68, 170), restingHeartRate: 64, sleepHours: 7.1, createdAt: dayjs().subtract(6, 'day').toISOString() },
	{ id: 'seed-health-4', date: dayjs().subtract(9, 'day').toISOString(), weight: 75, height: 170, bmi: calculateBmi(75, 170), restingHeartRate: 69, sleepHours: 6.8, createdAt: dayjs().subtract(9, 'day').toISOString() },
	{ id: 'seed-health-5', date: dayjs().subtract(12, 'day').toISOString(), weight: 82, height: 170, bmi: calculateBmi(82, 170), restingHeartRate: 71, sleepHours: 6.6, createdAt: dayjs().subtract(12, 'day').toISOString() },
	{ id: 'seed-health-6', date: dayjs().subtract(15, 'day').toISOString(), weight: 90, height: 170, bmi: calculateBmi(90, 170), restingHeartRate: 76, sleepHours: 6.2, createdAt: dayjs().subtract(15, 'day').toISOString() },
	{ id: 'seed-health-7', date: dayjs().subtract(19, 'day').toISOString(), weight: 95, height: 170, bmi: calculateBmi(95, 170), restingHeartRate: 78, sleepHours: 6.0, createdAt: dayjs().subtract(19, 'day').toISOString() },
	{ id: 'seed-health-8', date: dayjs().subtract(24, 'day').toISOString(), weight: 62, height: 170, bmi: calculateBmi(62, 170), restingHeartRate: 65, sleepHours: 7.5, createdAt: dayjs().subtract(24, 'day').toISOString() },
];

const sampleGoals: Goal[] = [
	{ id: 'seed-goal-1', name: 'Giảm 4kg trong 2 tháng', type: 'WeightLoss', targetValue: 4, currentValue: 2.6, unit: 'kg', deadline: dayjs().add(40, 'day').toISOString(), status: 'active', createdAt: dayjs().subtract(20, 'day').toISOString() },
	{ id: 'seed-goal-2', name: 'Chạy 100km/tháng', type: 'Endurance', targetValue: 100, currentValue: 100, unit: 'km', deadline: dayjs().subtract(2, 'day').toISOString(), status: 'achieved', createdAt: dayjs().subtract(35, 'day').toISOString() },
	{ id: 'seed-goal-3', name: 'Tăng cơ tay 2cm', type: 'MuscleGain', targetValue: 2, currentValue: 0.8, unit: 'cm', deadline: dayjs().add(10, 'day').toISOString(), status: 'cancelled', createdAt: dayjs().subtract(16, 'day').toISOString() },
	{ id: 'seed-goal-4', name: 'Ngủ đủ 7 giờ mỗi ngày', type: 'Other', targetValue: 30, currentValue: 18, unit: 'ngày', deadline: dayjs().add(15, 'day').toISOString(), status: 'active', createdAt: dayjs().subtract(8, 'day').toISOString() },
];

const sampleExercises: Exercise[] = [
	{ id: 'seed-exercise-1', name: 'Push Up', muscleGroup: 'Chest', difficulty: 'Easy', description: 'Bài chống đẩy cơ bản giúp phát triển ngực và tay sau.', instructions: 'Chống tay rộng bằng vai\nGiữ thân người thẳng\nHạ ngực chạm gần sàn\nĐẩy người lên vị trí ban đầu', caloriesPerHour: 450, createdAt: dayjs().subtract(30, 'day').toISOString() },
	{ id: 'seed-exercise-2', name: 'Pull Up', muscleGroup: 'Back', difficulty: 'Hard', description: 'Bài kéo xà tác động mạnh vào lưng xô và tay trước.', instructions: 'Nắm xà rộng hơn vai\nKéo cằm vượt qua xà\nSiết lưng ở đỉnh động tác\nHạ người chậm và kiểm soát', caloriesPerHour: 520, createdAt: dayjs().subtract(28, 'day').toISOString() },
	{ id: 'seed-exercise-3', name: 'Squat', muscleGroup: 'Legs', difficulty: 'Medium', description: 'Bài tập nền tảng cho chân, mông và core.', instructions: 'Đứng chân rộng bằng vai\nĐẩy hông ra sau\nHạ xuống tới khi đùi song song sàn\nĐứng lên bằng gót chân', caloriesPerHour: 480, createdAt: dayjs().subtract(27, 'day').toISOString() },
	{ id: 'seed-exercise-4', name: 'Shoulder Press', muscleGroup: 'Shoulders', difficulty: 'Medium', description: 'Bài đẩy vai với tạ hoặc máy.', instructions: 'Giữ tạ ngang vai\nĐẩy lên thẳng đầu\nKhóa nhẹ ở đỉnh\nHạ tạ có kiểm soát', caloriesPerHour: 400, createdAt: dayjs().subtract(26, 'day').toISOString() },
	{ id: 'seed-exercise-5', name: 'Bicep Curl', muscleGroup: 'Arms', difficulty: 'Easy', description: 'Bài cô lập cho cơ tay trước.', instructions: 'Đứng thẳng, khuỷu tay sát người\nCuốn tạ lên chậm\nSiết tay trước ở đỉnh\nHạ xuống từ từ', caloriesPerHour: 300, createdAt: dayjs().subtract(25, 'day').toISOString() },
	{ id: 'seed-exercise-6', name: 'Plank', muscleGroup: 'Core', difficulty: 'Easy', description: 'Giữ core ổn định và tăng sức bền thân giữa.', instructions: 'Chống khuỷu tay dưới vai\nSiết bụng và mông\nGiữ cơ thể thành một đường thẳng\nThở đều trong suốt bài', caloriesPerHour: 260, createdAt: dayjs().subtract(24, 'day').toISOString() },
	{ id: 'seed-exercise-7', name: 'Burpee', muscleGroup: 'Full Body', difficulty: 'Hard', description: 'Bài toàn thân cường độ cao.', instructions: 'Ngồi xổm đặt tay xuống sàn\nNhảy về tư thế plank\nThực hiện chống đẩy\nNhảy gập chân lên và bật cao', caloriesPerHour: 600, createdAt: dayjs().subtract(23, 'day').toISOString() },
	{ id: 'seed-exercise-8', name: 'Deadlift', muscleGroup: 'Back', difficulty: 'Hard', description: 'Bài kéo tổng hợp cho lưng, mông và đùi sau.', instructions: 'Đặt chân dưới thanh đòn\nGiữ lưng trung tính\nKéo đòn lên sát chân\nĐứng thẳng và siết mông', caloriesPerHour: 540, createdAt: dayjs().subtract(22, 'day').toISOString() },
	{ id: 'seed-exercise-9', name: 'Lunge', muscleGroup: 'Legs', difficulty: 'Medium', description: 'Bài bước chân giúp phát triển chân đơn bên.', instructions: 'Bước một chân ra trước\nHạ gối sau gần sàn\nGiữ thân người thẳng\nĐẩy người lên vị trí ban đầu', caloriesPerHour: 430, createdAt: dayjs().subtract(21, 'day').toISOString() },
	{ id: 'seed-exercise-10', name: 'Sun Salutation', muscleGroup: 'Full Body', difficulty: 'Easy', description: 'Chuỗi động tác yoga làm nóng toàn thân và cải thiện độ linh hoạt.', instructions: 'Đứng thẳng và hít vào\nGập người chạm sàn\nVào tư thế plank và hạ người\nNgẩng ngực và trở về vị trí đứng', caloriesPerHour: 280, createdAt: dayjs().subtract(20, 'day').toISOString() },
];

export const initSampleData = (): void => {
	if (!hasWindow()) {
		return;
	}
	const hasAnyData =
		readList<WorkoutSession>(WORKOUTS_KEY).length > 0 ||
		readList<HealthMetric>(HEALTH_METRICS_KEY).length > 0 ||
		readList<Goal>(GOALS_KEY).length > 0 ||
		readList<Exercise>(EXERCISES_KEY).length > 0;

	if (hasAnyData) {
		return;
	}

	writeList(WORKOUTS_KEY, sampleWorkouts);
	writeList(HEALTH_METRICS_KEY, sampleHealthMetrics);
	writeList(GOALS_KEY, sampleGoals);
	writeList(EXERCISES_KEY, sampleExercises);
};