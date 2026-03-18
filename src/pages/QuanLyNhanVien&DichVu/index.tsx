import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Select, TimePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import rules from '@/utils/rules';

const { TabPane } = Tabs;
const { Option } = Select;

export default function QuanLyNhanVien() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isEmpModalVisible, setIsEmpModalVisible] = useState(false);
  const [isSvcModalVisible, setIsSvcModalVisible] = useState(false);
  const [empForm] = Form.useForm();
  const [svcForm] = Form.useForm();
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);

  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedServices = localStorage.getItem('services');
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedServices) setServices(JSON.parse(savedServices));
  }, []);

  useEffect(() => {
    if (employees.length > 0) localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (services.length > 0) localStorage.setItem('services', JSON.stringify(services));
  }, [services]);

  const handleAddEmployee = () => { setEditingEmpId(null); empForm.resetFields(); setIsEmpModalVisible(true); };
  
  const handleEditEmployee = (record: any) => { 
    setEditingEmpId(record.id); 

    const formValues = { ...record };
    if (record.schedule) {
      try {
        const parts = record.schedule.split(' ');
        if (parts.length >= 3) {
          formValues.workDays = parts.slice(2).join(' ').split(', ');
          const timeRange = parts[0].split('-');
          if (timeRange.length === 2) {
            formValues.workTime = [dayjs(timeRange[0], 'HH:mm'), dayjs(timeRange[1], 'HH:mm')];
          }
        }
      } catch (e) {
      }
    }
    
    empForm.setFieldsValue(formValues); 
    setIsEmpModalVisible(true); 
  };
  
  const handleDeleteEmployee = (id: string) => {
    const newEmps = employees.filter(e => e.id !== id);
    setEmployees(newEmps);
    localStorage.setItem('employees', JSON.stringify(newEmps));
    message.success('Xóa nhân viên thành công');
  };
  
  const onEmpFinish = (values: any) => {
    let scheduleStr = '';
    if (values.workTime && values.workDays && values.workDays.length > 0) {
      const startTime = values.workTime[0].format('HH:mm');
      const endTime = values.workTime[1].format('HH:mm');
      scheduleStr = `${startTime}-${endTime} ${values.workDays.join(', ')}`;
    }

    const newEmpData = {
      name: values.name,
      limitPerDay: values.limitPerDay,
      schedule: scheduleStr
    };

    if (editingEmpId) setEmployees(employees.map(e => e.id === editingEmpId ? { ...e, ...newEmpData } : e));
    else setEmployees([...employees, { id: Date.now().toString(), ...newEmpData }]);
    
    setIsEmpModalVisible(false);
    message.success('Lưu nhân viên thành công');
  };

  const handleAddService = () => { setEditingSvcId(null); svcForm.resetFields(); setIsSvcModalVisible(true); };
  const handleEditService = (record: any) => { setEditingSvcId(record.id); svcForm.setFieldsValue(record); setIsSvcModalVisible(true); };
  const handleDeleteService = (id: string) => {
    const newSvcs = services.filter(s => s.id !== id);
    setServices(newSvcs);
    localStorage.setItem('services', JSON.stringify(newSvcs));
    message.success('Xóa dịch vụ thành công');
  };
  const onSvcFinish = (values: any) => {
    if (editingSvcId) setServices(services.map(s => s.id === editingSvcId ? { ...s, ...values } : s));
    else setServices([...services, { id: Date.now().toString(), ...values }]);
    setIsSvcModalVisible(false);
    message.success('Lưu dịch vụ thành công');
  };

  const empColumns = [
    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name' },
    { title: 'Giới hạn khách / ngày', dataIndex: 'limitPerDay', key: 'limitPerDay' },
    { title: 'Lịch làm việc', dataIndex: 'schedule', key: 'schedule' },
    {
      title: 'Hành động', key: 'action', render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditEmployee(record)} type="primary" ghost>Sửa</Button>
          <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDeleteEmployee(record.id)}>
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const svcColumns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
    { title: 'Giá (VNĐ)', dataIndex: 'price', key: 'price', render: (val: number) => val?.toLocaleString() },
    { title: 'Thời gian thực hiện (phút)', dataIndex: 'duration', key: 'duration' },
    {
      title: 'Hành động', key: 'action', render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditService(record)} type="primary" ghost>Sửa</Button>
          <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDeleteService(record.id)}>
            <Button icon={<DeleteOutlined />} danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const daysOfWeek = [
    'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'
  ];

  return (
    <>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Nhân viên" key="1">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEmployee} style={{ marginBottom: 16 }}>Thêm nhân viên</Button>
          <Table dataSource={employees} columns={empColumns} rowKey="id" />
        </TabPane>
        <TabPane tab="Dịch vụ" key="2">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddService} style={{ marginBottom: 16 }}>Thêm dịch vụ</Button>
          <Table dataSource={services} columns={svcColumns} rowKey="id" />
        </TabPane>
      </Tabs>

      <Modal title={editingEmpId ? "Sửa nhân viên" : "Thêm nhân viên"} visible={isEmpModalVisible} onCancel={() => setIsEmpModalVisible(false)} onOk={() => empForm.submit()} destroyOnClose>
        <Form form={empForm} layout="vertical" onFinish={onEmpFinish}>
          <Form.Item name="name" label="Tên nhân viên" rules={[...rules.required, ...rules.ten]}><Input /></Form.Item>
          <Form.Item name="limitPerDay" label="Giới hạn khách / ngày" rules={rules.required}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="workDays" label="Ngày làm việc trong tuần" rules={rules.required}>
            <Select mode="multiple" placeholder="Chọn ngày" style={{ width: '100%' }}>
              {daysOfWeek.map(day => <Option key={day} value={day}>{day}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="workTime" label="Khung giờ làm việc" rules={rules.required}>
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={editingSvcId ? "Sửa dịch vụ" : "Thêm dịch vụ"} visible={isSvcModalVisible} onCancel={() => setIsSvcModalVisible(false)} onOk={() => svcForm.submit()} destroyOnClose>
        <Form form={svcForm} layout="vertical" onFinish={onSvcFinish}>
          <Form.Item name="name" label="Tên dịch vụ" rules={[...rules.required, ...rules.text]}><Input /></Form.Item>
          <Form.Item name="price" label="Giá (VNĐ)" rules={rules.required}><InputNumber min={0} /></Form.Item>
          <Form.Item name="duration" label="Thời gian thực hiện (phút)" rules={rules.required}><InputNumber min={1} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
