import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Modal, Form, Input, DatePicker, InputNumber, Select, message, Popconfirm, Progress, Row, Col, Typography, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useSharedState } from '@/utils/storage';
import rules from '@/utils/rules';

const { TabPane } = Tabs;
const { Title } = Typography;

interface Subject { id: string; name: string; }
interface StudySession { id: string; subjectId: string; date: string; durationMinutes: number; content: string; notes: string; }
interface MonthlyGoal { id: string; subjectId: string; month: string; targetMinutes: number; }

const DEFAULT_SUBJECTS: Subject[] = [
    { id: '1', name: 'Toán' },
    { id: '2', name: 'Văn' },
    { id: '3', name: 'Anh' },
    { id: '4', name: 'Khoa học' },
    { id: '5', name: 'Công nghệ' }
];

const QuanLyHocTap: React.FC = () => {

    const [subjects, setSubjects] = useSharedState<Subject[]>('qlht_subjects', DEFAULT_SUBJECTS);
    const [sessions, setSessions] = useSharedState<StudySession[]>('qlht_sessions', []);
    const [goals, setGoals] = useSharedState<MonthlyGoal[]>('qlht_goals', []);

    const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
    const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);

    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingSession, setEditingSession] = useState<StudySession | null>(null);
    const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);

    const [subjectForm] = Form.useForm();
    const [sessionForm] = Form.useForm();
    const [goalForm] = Form.useForm();

    const [currentMonth, setCurrentMonth] = useState<string>(moment().format('YYYY-MM'));

    const handleSubjectSubmit = (values: any) => {
        if (editingSubject) {
            setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, name: values.name } : s));
            message.success('Cập nhật môn học thành công!');
        } else {
            const newSubject = { id: Date.now().toString(), name: values.name };
            setSubjects([...subjects, newSubject]);
            message.success('Thêm môn học thành công!');
        }
        setIsSubjectModalVisible(false);
        subjectForm.resetFields();
    };

    const deleteSubject = (id: string) => {
        setSubjects(subjects.filter(s => s.id !== id));
        setSessions(sessions.filter(s => s.subjectId !== id));
        setGoals(goals.filter(g => g.subjectId !== id));
        message.success('Xóa môn học thành công!');
    };

    const handleSessionSubmit = (values: any) => {
        const sessionData: StudySession = {
            id: editingSession ? editingSession.id : Date.now().toString(),
            subjectId: values.subjectId,
            date: values.date.toISOString(),
            durationMinutes: values.durationMinutes,
            content: values.content,
            notes: values.notes || ''
        };

        if (editingSession) {
            setSessions(sessions.map(s => s.id === editingSession.id ? sessionData : s));
            message.success('Cập nhật buổi học thành công!');
        } else {
            setSessions([...sessions, sessionData]);
            message.success('Thêm buổi học thành công!');
        }
        setIsSessionModalVisible(false);
        sessionForm.resetFields();
    };

    const deleteSession = (id: string) => {
        setSessions(sessions.filter(s => s.id !== id));
        message.success('Xóa buổi học thành công!');
    };

    const handleGoalSubmit = (values: any) => {
        const goalData: MonthlyGoal = {
            id: editingGoal ? editingGoal.id : Date.now().toString(),
            subjectId: values.subjectId,
            month: values.month.format('YYYY-MM'),
            targetMinutes: values.targetMinutes
        };

        const targetMonth = values.month.format('YYYY-MM');

        if (!editingGoal && goals.find(g => g.subjectId === goalData.subjectId && g.month === targetMonth)) {
            message.error('Mục tiêu cho môn học này trong tháng đã tồn tại!');
            return;
        }

        if (editingGoal) {
            setGoals(goals.map(g => g.id === editingGoal.id ? goalData : g));
            message.success('Cập nhật mục tiêu thành công!');
        } else {
            setGoals([...goals, goalData]);
            message.success('Thêm mục tiêu thành công!');
        }
        setIsGoalModalVisible(false);
        goalForm.resetFields();
    };

    const deleteGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
        message.success('Xóa mục tiêu thành công!');
    };

    const getMonthProgress = (subjectId: string, month: string) => {
        const monthSessions = sessions.filter(s => s.subjectId === subjectId && moment(s.date).format('YYYY-MM') === month);
        const totalMinutes = monthSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
        return totalMinutes;
    };

    return (
        <Card title={<Title level={3}>Quản Lý Học Tập</Title>} bordered={false}>
            <Tabs defaultActiveKey="1">
                <TabPane tab="1. Danh mục môn học" key="1">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSubject(null); subjectForm.resetFields(); setIsSubjectModalVisible(true); }}>
                        Thêm môn học
                    </Button>
                    <Table
                        dataSource={subjects}
                        rowKey="id"
                        columns={[
                            { title: 'Tên môn học', dataIndex: 'name', key: 'name' },
                            {
                                title: 'Hành động', key: 'action', render: (_, record) => (
                                    <Space size="middle">
                                        <Button icon={<EditOutlined />} onClick={() => { setEditingSubject(record); subjectForm.setFieldsValue(record); setIsSubjectModalVisible(true); }} />
                                        <Popconfirm title="Bạn có chắc chắn muốn xóa môn học này?" onConfirm={() => deleteSubject(record.id)}>
                                            <Button danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </Space>
                                )
                            }
                        ]}
                    />
                </TabPane>
                <TabPane tab="2. Tiến độ học tập" key="2">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSession(null); sessionForm.resetFields(); setIsSessionModalVisible(true); }}>
                        Thêm lịch học
                    </Button>
                    <Table
                        dataSource={[...sessions].sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf())}
                        rowKey="id"
                        columns={[
                            { title: 'Môn học', dataIndex: 'subjectId', key: 'subjectId', render: (id) => subjects.find(s => s.id === id)?.name || 'N/A' },
                            { title: 'Ngày', dataIndex: 'date', key: 'date', render: (date) => moment(date).format('DD/MM/YYYY HH:mm') },
                            { title: 'Thời lượng (phút)', dataIndex: 'durationMinutes', key: 'durationMinutes' },
                            { title: 'Nội dung', dataIndex: 'content', key: 'content' },
                            { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
                            {
                                title: 'Hành động', key: 'action', render: (_, record) => (
                                    <Space size="middle">
                                        <Button icon={<EditOutlined />} onClick={() => { setEditingSession(record); sessionForm.setFieldsValue({ ...record, date: moment(record.date) }); setIsSessionModalVisible(true); }} />
                                        <Popconfirm title="Bạn có chắc chắn muốn xóa buổi học này?" onConfirm={() => deleteSession(record.id)}>
                                            <Button danger icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </Space>
                                )
                            }
                        ]}
                    />
                </TabPane>
                <TabPane tab="3. Mục tiêu học tập" key="3">
                    <Row gutter={16}>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingGoal(null); goalForm.resetFields(); setIsGoalModalVisible(true); }}>
                                Thêm mục tiêu
                            </Button>
                        </Col>
                        <Col>
                            <DatePicker picker="month" value={moment(currentMonth, 'YYYY-MM')} onChange={(date) => setCurrentMonth(date ? date.format('YYYY-MM') : moment().format('YYYY-MM'))} allowClear={false} />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        {goals.filter(g => g.month === currentMonth).map(goal => {
                            const achieved = getMonthProgress(goal.subjectId, goal.month);
                            const percent = Math.min(Math.round((achieved / goal.targetMinutes) * 100), 100);
                            return (
                                <Col xs={24} md={12} lg={8} key={goal.id}>
                                    <Card
                                        title={subjects.find(s => s.id === goal.subjectId)?.name || 'N/A'}
                                        extra={
                                            <Space>
                                                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => { setEditingGoal(goal); goalForm.setFieldsValue({ ...goal, month: moment(goal.month, 'YYYY-MM') }); setIsGoalModalVisible(true); }} />
                                                <Popconfirm title="Xóa?" onConfirm={() => deleteGoal(goal.id)}>
                                                    <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            </Space>
                                        }
                                    >
                                        <div>
                                            <Progress type="dashboard" percent={percent} status={percent >= 100 ? "success" : "active"} />
                                            <div>
                                                Đã học: <b>{achieved}</b> / {goal.targetMinutes} phút
                                            </div>
                                            <div>
                                                {percent >= 100 ? 'Đã đạt mục tiêu!' : 'Chưa đạt mục tiêu'}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                        {goals.filter(g => g.month === currentMonth).length === 0 && (
                            <Col span={24}>
                                <div>Chưa có mục tiêu nào trong tháng này.</div>
                            </Col>
                        )}
                    </Row>
                </TabPane>
            </Tabs>

            <Modal title={editingSubject ? "Sửa môn học" : "Thêm môn học"} visible={isSubjectModalVisible} onCancel={() => setIsSubjectModalVisible(false)} onOk={() => subjectForm.submit()}>
                <Form form={subjectForm} onFinish={handleSubjectSubmit} layout="vertical">
                    <Form.Item name="name" label="Tên môn học" rules={rules.required}>
                        <Input placeholder="Ví dụ: Toán" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title={editingSession ? "Sửa lịch học" : "Thêm lịch học"} visible={isSessionModalVisible} onCancel={() => setIsSessionModalVisible(false)} onOk={() => sessionForm.submit()}>
                <Form form={sessionForm} onFinish={handleSessionSubmit} layout="vertical">
                    <Form.Item name="subjectId" label="Môn học" rules={rules.required}>
                        <Select placeholder="Chọn môn học">
                            {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Ngày giờ học" rules={rules.required}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" />
                    </Form.Item>
                    <Form.Item name="durationMinutes" label="Thời lượng (phút)" rules={rules.required}>
                        <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung đã học" rules={rules.required}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title={editingGoal ? "Sửa mục tiêu" : "Thêm mục tiêu"} visible={isGoalModalVisible} onCancel={() => setIsGoalModalVisible(false)} onOk={() => goalForm.submit()}>
                <Form form={goalForm} onFinish={handleGoalSubmit} layout="vertical">
                    <Form.Item name="subjectId" label="Môn học" rules={rules.required}>
                        <Select placeholder="Chọn môn học" disabled={!!editingGoal}>
                            {subjects.map(s => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="month" label="Tháng" rules={rules.required}>
                        <DatePicker picker="month" disabled={!!editingGoal} />
                    </Form.Item>
                    <Form.Item name="targetMinutes" label="Mục tiêu thời lượng (phút)" rules={rules.required}>
                        <InputNumber min={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default QuanLyHocTap;
