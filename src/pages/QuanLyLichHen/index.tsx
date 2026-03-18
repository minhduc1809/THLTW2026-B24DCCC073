import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, message, Input, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import rules from '@/utils/rules';

const { Option } = Select;

export default function QuanLyLichHen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const savedAppts = localStorage.getItem('appointments');
    const savedEmps = localStorage.getItem('employees');
    const savedSvcs = localStorage.getItem('services');

    if (savedAppts) setAppointments(JSON.parse(savedAppts));
    if (savedEmps) setEmployees(JSON.parse(savedEmps));
    if (savedSvcs) setServices(JSON.parse(savedSvcs));
  }, []);

  useEffect(() => {
    if (appointments.length > 0) localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<any>({ date: null, time: null });

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setSelectedDateTime({ date: null, time: null });
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    const mDate = dayjs(record.date, 'YYYY-MM-DD');
    const mTime = dayjs(record.time, 'HH:mm');
    form.setFieldsValue({
      ...record,
      date: mDate,
      time: mTime,
    });
    setSelectedDateTime({ date: mDate, time: mTime });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newAppts = appointments.filter(a => a.id !== id);
    setAppointments(newAppts);
    if (newAppts.length === 0) localStorage.removeItem('appointments');
    else localStorage.setItem('appointments', JSON.stringify(newAppts));
    message.success('Xóa lịch hẹn thành công');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const newAppts = appointments.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setAppointments(newAppts);
    message.success('Cập nhật trạng thái thành công');
  };

  const onFinish = (values: any) => {
    const newDate = values.date.format('YYYY-MM-DD');
    const newTime = values.time.format('HH:mm');

    const appointmentDateTime = dayjs(`${newDate} ${newTime}`, 'YYYY-MM-DD HH:mm');
    if (appointmentDateTime.isBefore(dayjs())) {
      message.error('Ngày và giờ hẹn phải ở tương lai!');
      return;
    }

    const isConflict = appointments.some(app => 
      app.id !== editingId && 
      app.employeeId === values.employeeId && 
      app.date === newDate && 
      app.time === newTime &&
      app.status !== 'Hủy'
    );

    if (isConflict) {
      message.error('Lịch trùng: Nhân viên đã có hẹn vào thời gian này!');
      return;
    }

    const data = {
      customerName: values.customerName,
      employeeId: values.employeeId,
      serviceId: values.serviceId,
      date: newDate,
      time: newTime,
    };

    if (editingId) {
      setAppointments(appointments.map(a => a.id === editingId ? { ...a, ...data } : a));
      message.success('Cập nhật lịch hẹn thành công');
    } else {
      setAppointments([...appointments, { id: Date.now().toString(), ...data, status: 'Chờ duyệt' }]);
      message.success('Thêm lịch hẹn thành công');
    }
    setIsModalVisible(false);
  };

  const statusColors: any = {
    'Chờ duyệt': 'orange',
    'Xác nhận': 'blue',
    'Hoàn thành': 'green',
    'Hủy': 'red',
  };

  const columns = [
    { title: 'Tên khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { 
      title: 'Dịch vụ', 
      dataIndex: 'serviceId', 
      key: 'serviceId',
      render: (id: string) => services.find(s => s.id === id)?.name || 'Không xác định' 
    },
    { 
      title: 'Nhân viên', 
      dataIndex: 'employeeId', 
      key: 'employeeId',
      render: (id: string) => employees.find(e => e.id === id)?.name || 'Không xác định' 
    },
    { title: 'Ngày hẹn', dataIndex: 'date', key: 'date' },
    { title: 'Giờ hẹn', dataIndex: 'time', key: 'time' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string, record: any) => (
        <Select 
          value={status} 
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
        >
          {Object.keys(statusColors).map(st => (
            <Option key={st} value={st}>
              <Tag color={statusColors[st]}>{st}</Tag>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Hành động', key: 'action', render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="primary" ghost size="small">Sửa</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger size="small">Xóa</Button>
        </Space>
      ),
    },
  ];

  const availableEmployees = employees.filter(emp => {
    if (!selectedDateTime.date || !selectedDateTime.time) return false;
    
    const dayOfWeekIndex = selectedDateTime.date.day();
    const dayNameMap: any = { 0: 'Chủ nhật', 1: 'Thứ 2', 2: 'Thứ 3', 3: 'Thứ 4', 4: 'Thứ 5', 5: 'Thứ 6', 6: 'Thứ 7' };
    const dayName = dayNameMap[dayOfWeekIndex];
    
    if (!emp.schedule || !emp.schedule.includes(dayName)) return false;

    try {
      const timeRange = emp.schedule.split(' ')[0].split('-');
      if (timeRange.length === 2) {
        const empStart = dayjs(timeRange[0], 'HH:mm');
        const empEnd = dayjs(timeRange[1], 'HH:mm');
        const pickTime = dayjs(selectedDateTime.time.format('HH:mm'), 'HH:mm');
        
        if (pickTime.isBefore(empStart) || pickTime.isAfter(empEnd)) {
          return false;
        }
      }
    } catch(e) {}
    
    return true;
  });

  return (
    <div>
      <h1>Quản Lý Lịch Hẹn</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Đặt lịch hẹn mới</Button>
      <br /><br />
      <Table dataSource={appointments} columns={columns} rowKey="id" />

      <Modal title={editingId ? "Cập nhật lịch hẹn" : "Đặt lịch hẹn"} visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} destroyOnClose>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.date || changedValues.time) {
              setSelectedDateTime({ date: allValues.date, time: allValues.time });
              if (changedValues.date || changedValues.time) {
                form.setFieldsValue({ employeeId: undefined });
              }
            }
          }}
        >
          <Form.Item name="customerName" label="Tên khách hàng" rules={[...rules.required, ...rules.ten]}><Input /></Form.Item>
          
          <Form.Item name="date" label="Ngày hẹn" rules={rules.required}>
            <DatePicker 
              format="YYYY-MM-DD" 
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          
          <Form.Item name="time" label="Giờ hẹn" rules={rules.required}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          
          <Form.Item name="serviceId" label="Dịch vụ" rules={rules.required}>
            <Select placeholder="Chọn dịch vụ">
              {services.map(svc => <Option key={svc.id} value={svc.id}>{svc.name} - {svc.price?.toLocaleString()}đ</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="employeeId" label="Nhân viên" rules={rules.required}>
            <Select placeholder={(!selectedDateTime.date || !selectedDateTime.time) ? "Vui lòng chọn ngày và giờ trước" : (availableEmployees.length === 0 ? "Không có nhân viên phù hợp" : "Chọn nhân viên")} disabled={!selectedDateTime.date || !selectedDateTime.time || availableEmployees.length === 0}>
              {availableEmployees.map(emp => <Option key={emp.id} value={emp.id}>{emp.name}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
