import React, { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Radio } from 'antd';
import dayjs from 'dayjs';
import TableBase from '@/components/Table/TableStaticData';

const { TabPane } = Tabs;

export default function ThongKeBaoCao() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [timeView, setTimeView] = useState<'day' | 'month'>('day');

  useEffect(() => {
    const savedAppts = localStorage.getItem('appointments');
    const savedSvcs = localStorage.getItem('services');
    const savedEmps = localStorage.getItem('employees');

    if (savedAppts) setAppointments(JSON.parse(savedAppts));
    if (savedSvcs) setServices(JSON.parse(savedSvcs));
    if (savedEmps) setEmployees(JSON.parse(savedEmps));
  }, []);

  const getApptsStats = () => {
    const grouped: any = {};
    appointments.forEach(app => {
      const key = timeView === 'day' ? app.date : (app.date ? dayjs(app.date).format('YYYY-MM') : '');
      if (!key) return;
      if (!grouped[key]) {
        grouped[key] = { key, period: key, total: 0, completed: 0, canceled: 0, pending: 0, confirmed: 0 };
      }
      grouped[key].total += 1;
      if (app.status === 'Hoàn thành') grouped[key].completed += 1;
      else if (app.status === 'Hủy') grouped[key].canceled += 1;
      else if (app.status === 'Xác nhận') grouped[key].confirmed += 1;
      else if (app.status === 'Chờ duyệt') grouped[key].pending += 1;
    });
    return Object.values(grouped).sort((a: any, b: any) => b.key.localeCompare(a.key));
  };

  const revenueBySvcMap: any = {};
  const revenueByEmpMap: any = {};

  appointments.forEach(app => {
    if (app.status === 'Hoàn thành') {
      const svc = services.find(s => s.id === app.serviceId);
      const price = svc ? Number(svc.price) : 0;
      
      const svcName = svc ? svc.name : 'Không xác định';
      const svcId = app.serviceId || 'unknown_svc';
      if (!revenueBySvcMap[svcId]) {
        revenueBySvcMap[svcId] = { key: svcId, name: svcName, revenue: 0, count: 0 };
      }
      revenueBySvcMap[svcId].revenue += price;
      revenueBySvcMap[svcId].count += 1;

      const emp = employees.find(e => e.id === app.employeeId);
      const empName = emp ? emp.name : 'Không xác định';
      const empId = app.employeeId || 'unknown_emp';
      if (!revenueByEmpMap[empId]) {
        revenueByEmpMap[empId] = { key: empId, name: empName, revenue: 0, count: 0 };
      }
      revenueByEmpMap[empId].revenue += price;
      revenueByEmpMap[empId].count += 1;
    }
  });

  const svcData = Object.values(revenueBySvcMap).sort((a: any, b: any) => b.revenue - a.revenue);
  const empData = Object.values(revenueByEmpMap).sort((a: any, b: any) => b.revenue - a.revenue);

  const apptColumns = [
    { title: timeView === 'day' ? 'Ngày hẹn' : 'Tháng hẹn', dataIndex: 'period', key: 'period', width: 120 },
    { title: 'Tổng số hẹn', dataIndex: 'total', key: 'total', align: 'center' as const, width: 120 },
    { title: 'Hoàn thành', dataIndex: 'completed', key: 'completed', align: 'center' as const, width: 120 },
    { title: 'Đã xác nhận', dataIndex: 'confirmed', key: 'confirmed', align: 'center' as const, width: 120 },
    { title: 'Chờ duyệt', dataIndex: 'pending', key: 'pending', align: 'center' as const, width: 120 },
    { title: 'Hủy bỏ', dataIndex: 'canceled', key: 'canceled', align: 'center' as const, width: 120 },
  ];

  const svcColumns = [
    { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Số lượt sử dụng', dataIndex: 'count', key: 'count', align: 'center' as const, width: 120 },
    { title: 'Doanh thu (VNĐ)', dataIndex: 'revenue', key: 'revenue', align: 'right' as const, render: (val: number) => val.toLocaleString(), width: 150 },
  ];

  const empColumns = [
    { title: 'Tên nhân viên', dataIndex: 'name', key: 'name', width: 200 },
    { title: 'Số lượt phục vụ', dataIndex: 'count', key: 'count', align: 'center' as const, width: 120 },
    { title: 'Doanh thu (VNĐ)', dataIndex: 'revenue', key: 'revenue', align: 'right' as const, render: (val: number) => val.toLocaleString(), width: 150 },
  ];

  return (
    <div>
      <Card title="Thống Kê & Báo Cáo" bordered={false}>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <TabPane tab="Thống kê số lượng lịch hẹn" key="1">
            <div style={{ marginBottom: 16 }}>
              <Radio.Group value={timeView} onChange={e => setTimeView(e.target.value)} buttonStyle="solid">
                <Radio.Button value="day">Theo ngày</Radio.Button>
                <Radio.Button value="month">Theo tháng</Radio.Button>
              </Radio.Group>
            </div>
            <TableBase 
              data={getApptsStats()}
              columns={apptColumns}
              hasTotal
              addStt
            />
          </TabPane>
          <TabPane tab="Thống kê doanh thu" key="2">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <TableBase 
                  title="Theo dịch vụ"
                  data={svcData}
                  columns={svcColumns}
                  hasTotal
                  addStt
                />
              </Col>
              <Col span={12}>
                <TableBase 
                  title="Theo nhân viên"
                  data={empData}
                  columns={empColumns}
                  hasTotal
                  addStt
                />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
