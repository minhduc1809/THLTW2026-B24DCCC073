import React, { useState, useEffect } from 'react';
import { Card, Rate, Avatar, List, Input, Button, Tabs, Space, Select, Modal, Form, message } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import rules from '@/utils/rules';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

export default function DanhGiaDichVu() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    const savedEmps = localStorage.getItem('employees');
    const savedAppts = localStorage.getItem('appointments');

    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedEmps) setEmployees(JSON.parse(savedEmps));
    if (savedAppts) setAppointments(JSON.parse(savedAppts));
  }, []);

  useEffect(() => {
    if (reviews.length > 0) localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleReply = (reviewId: string, replyContent: string) => {
    const newReviews = reviews.map(r => r.id === reviewId ? { ...r, reply: replyContent } : r);
    setReviews(newReviews);
    localStorage.setItem('reviews', JSON.stringify(newReviews)); // Force save immediately
    message.success('Đã gửi phản hồi');
  };

  const completedAppointments = appointments.filter(a => a.status === 'Hoàn thành');

  const showModal = () => {
    if (completedAppointments.length === 0) {
      message.warning('Chưa có khách hàng nào hoàn thành dịch vụ để đánh giá!');
      return;
    }
    setIsModalVisible(true);
  };

  const onAddReview = (values: any) => {
    const appointment = appointments.find(a => a.id === values.appointmentId);
    if (!appointment) {
      message.error('Không tìm thấy lịch hẹn tương ứng');
      return;
    }

    const employee = employees.find(e => e.id === appointment.employeeId);
    if (!employee) {
      message.error('Không tìm thấy nhân viên');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      customerName: appointment.customerName,
      employeeId: employee.id,
      employeeName: employee.name,
      rating: values.rating,
      comment: values.comment,
      reply: '',
      date: dayjs().format('YYYY-MM-DD HH:mm')
    };

    const newReviews = [newReview, ...reviews];
    setReviews(newReviews);
    localStorage.setItem('reviews', JSON.stringify(newReviews));
    setIsModalVisible(false);
    form.resetFields();
    message.success('Đã thêm đánh giá');
  };

  const employeesStats = employees.map(emp => {
    const empReviews = reviews.filter(r => r.employeeId === emp.id);
    const totalReviews = empReviews.length;
    const avgRating = totalReviews > 0 ? (empReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
    return {
      id: emp.id,
      name: emp.name,
      avgRating: Number(avgRating.toFixed(1)),
      totalReviews
    };
  });

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '80vh' }}>
      <h1>Đánh Giá Dịch Vụ & Nhân Viên</h1>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Danh sách đánh giá" key="1">
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: 16 }}>
            Thêm đánh giá mới
          </Button>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>Chưa có đánh giá nào</div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={reviews}
              renderItem={item => (
                <Card style={{ marginBottom: 16 }}>
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <strong>{item.customerName}</strong>
                          <span style={{ color: '#888', fontWeight: 'normal' }}>đã đánh giá nhân viên <b>{item.employeeName}</b></span>
                          <span style={{ color: '#ccc', fontSize: '12px', marginLeft: 8 }}>{item.date}</span>
                        </Space>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <Rate disabled defaultValue={item.rating} style={{ fontSize: 14, marginBottom: 8 }} />
                          <br />
                          <span style={{ color: '#333' }}>"{item.comment}"</span>
                          
                          <div style={{ marginTop: 16, padding: '12px', background: '#f5f5f5', borderRadius: 8 }}>
                            {item.reply ? (
                              <div>
                                <UserOutlined style={{ marginRight: 8 }} /> <b>{item.employeeName} phản hồi:</b>
                                <p style={{ margin: '4px 0 0 0', color: '#333' }}>{item.reply}</p>
                              </div>
                            ) : (
                              <ReplyForm onSubmit={(msg: string) => handleReply(item.id, msg)} />
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                </Card>
              )}
            />
          )}
        </TabPane>
        
        <TabPane tab="Thống kê đánh giá nhân viên" key="2">
          {employeesStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>Chưa có nhân viên nào để thống kê</div>
          ) : (
            <List
              grid={{ gutter: 16, column: 4, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={employeesStats}
              renderItem={item => (
                <List.Item>
                  <Card title={item.name} bordered={true}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, color: '#fa8c16', fontWeight: 'bold' }}>{item.avgRating}</div>
                      <Rate disabled allowHalf value={item.avgRating} />
                      <div style={{ marginTop: 8, color: '#888' }}>{item.totalReviews} lượt đánh giá</div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>

      <Modal title="Viết đánh giá" visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onAddReview}>
          <Form.Item name="appointmentId" label="Chọn dịch vụ đã hoàn thành" rules={rules.required}>
            <Select placeholder="Chọn lịch hẹn đã sử dụng">
              {completedAppointments.map(app => (
                <Option key={app.id} value={app.id}>
                  Khách: {app.customerName} - Ngày: {app.date} lúc {app.time}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rating" label="Đánh giá" rules={rules.required}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="Bình luận" rules={[...rules.required, ...rules.text]}>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}

const ReplyForm = ({ onSubmit }: { onSubmit: (msg: string) => void }) => {
  const [reply, setReply] = useState('');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <TextArea rows={2} placeholder="Nhập phản hồi của bạn..." value={reply} onChange={e => setReply(e.target.value)} />
      <Button type="primary" size="small" style={{ alignSelf: 'flex-start' }} onClick={() => {
        if(reply.trim()) {
          onSubmit(reply);
          setReply('');
        }
      }}>Gửi phản hồi</Button>
    </div>
  );
};
