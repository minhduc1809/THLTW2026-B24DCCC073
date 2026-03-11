import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Button, Form, Input, Select, InputNumber, Space, message, Row, Col, Modal } from 'antd';

const { TabPane } = Tabs;
const { Option } = Select;

const levels = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];
const rules = [{ required: true, message: 'Bắt buộc' }];

const NganHangCauHoi: React.FC = () => {
    const [data, setData] = useState<any>(() => {
        const localData = localStorage.getItem('nganHangCauHoiData');
        return localData ? JSON.parse(localData) : { khoi: [], mon: [], cauHoi: [], deThi: [] };
    });

    useEffect(() => {
        localStorage.setItem('nganHangCauHoiData', JSON.stringify(data));
    }, [data]);

    const [formKhoi] = Form.useForm();
    const [formMon] = Form.useForm();
    const [formCauHoi] = Form.useForm();
    const [formDeThi] = Form.useForm();

    const [filterMon, setFilterMon] = useState<string | null>(null);
    const [filterKhoi, setFilterKhoi] = useState<string | null>(null);
    const [filterMucDo, setFilterMucDo] = useState<string | null>(null);

    const getFilteredCauHoi = () => {
        return data.cauHoi.filter((c: any) => {
            const matchMon = filterMon ? c.mon === filterMon : true;
            const matchKhoi = filterKhoi ? c.khoi === filterKhoi : true;
            const matchMucDo = filterMucDo ? c.mucDo === filterMucDo : true;
            return matchMon && matchKhoi && matchMucDo;
        });
    };

    const generateId = () => Date.now().toString();

    const handleAdd = (key: string, values: any, formInstance: any) => {
        if (key === 'mon' && data.mon.some((m: any) => m.ma === values.ma)) {
            message.error('Mã môn học đã tồn tại!');
            return;
        }
        if (key === 'cauHoi' && data.cauHoi.some((c: any) => c.ma === values.ma)) {
            message.error('Mã câu hỏi đã tồn tại!');
            return;
        }
        setData((prevData: any) => ({
            ...prevData,
            [key]: [{ id: generateId(), ...values }, ...prevData[key]],
        }));
        formInstance.resetFields();
    };

    const handleGenerateDeThi = (values: any) => {
        let resultQuestions: any[] = [];
        let hasError = false;

        if (!values.cauTruc || values.cauTruc.length === 0) {
            message.error('Vui lòng thêm cấu trúc đề');
            return;
        }

        values.cauTruc.forEach((cauTrucItem: any) => {
            const matchingQuestions = data.cauHoi.filter((question: any) => {
                return (
                    question.mon === values.mon && question.mucDo === cauTrucItem.mucDo && question.khoi === cauTrucItem.khoi
                );
            });

            if (matchingQuestions.length < cauTrucItem.sl) {
                hasError = true;
                message.error(`Thiếu câu hỏi độ khó ${cauTrucItem.mucDo}`);
            }

            const randomizedQuestions = matchingQuestions.sort(() => 0.5 - Math.random()).slice(0, cauTrucItem.sl);

            resultQuestions.push(...randomizedQuestions);
        });

        if (!hasError && resultQuestions.length > 0) {
            handleAdd('deThi', { ...values, cauHoi: resultQuestions }, formDeThi);
            message.success('Sinh đề thành công!');
        }
    };

    return (
        <Card title='Ngân Hàng Câu Hỏi Tự Luận' bordered={false}>
            <Tabs defaultActiveKey='1'>
                <TabPane tab='1. Khối Kiến Thức' key='1'>
                    <Card title='Quản Lý Khối Kiến Thức' size='small'>
                        <Form form={formKhoi} layout='inline' onFinish={(values) => handleAdd('khoi', values, formKhoi)}>
                            <Form.Item name='ten' rules={rules}>
                                <Input placeholder='Tên khối' />
                            </Form.Item>
                            <Button htmlType='submit' type='primary'>
                                Thêm
                            </Button>
                        </Form>
                        <Table
                            size='small'
                            columns={[{ title: 'Tên Khối', dataIndex: 'ten' }]}
                            dataSource={data.khoi}
                            rowKey='id'
                            style={{ marginTop: 16 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab='2. Môn Học' key='2'>
                    <Card title='Quản Lý Môn Học' size='small'>
                        <Form form={formMon} layout='inline' onFinish={(values) => handleAdd('mon', values, formMon)}>
                            <Form.Item name='ma' rules={rules}>
                                <Input placeholder='Mã môn' style={{ width: 120 }} />
                            </Form.Item>
                            <Form.Item name='ten' rules={rules}>
                                <Input placeholder='Tên môn học' style={{ width: 200 }} />
                            </Form.Item>
                            <Form.Item name='tc' rules={rules}>
                                <InputNumber placeholder='Số Tín Chỉ' min={1} style={{ width: 120 }} />
                            </Form.Item>
                            <Button htmlType='submit' type='primary'>
                                Thêm
                            </Button>
                        </Form>
                        <Table
                            size='small'
                            columns={[
                                { title: 'Mã Môn', dataIndex: 'ma' },
                                { title: 'Tên Môn', dataIndex: 'ten' },
                                { title: 'Số Tín Chỉ', dataIndex: 'tc' },
                            ]}
                            dataSource={data.mon}
                            rowKey='id'
                            style={{ marginTop: 16 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab='3. Câu Hỏi' key='3'>
                    <Card title='Quản Lý Câu Hỏi' size='small'>
                        <Form form={formCauHoi} layout='inline' onFinish={(values) => handleAdd('cauHoi', values, formCauHoi)}>
                            <Form.Item name='ma' rules={rules}>
                                <Input placeholder='Mã CH' style={{ width: 100 }} />
                            </Form.Item>
                            <Form.Item name='mon' rules={rules}>
                                <Select placeholder='Môn Học' style={{ width: 150 }}>
                                    {data.mon.map((m: any) => (
                                        <Option key={m.id} value={m.id}>
                                            {m.ten}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name='khoi' rules={rules}>
                                <Select placeholder='Khối Kiến Thức' style={{ width: 150 }}>
                                    {data.khoi.map((k: any) => (
                                        <Option key={k.id} value={k.id}>
                                            {k.ten}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name='mucDo' rules={rules}>
                                <Select placeholder='Mức độ' style={{ width: 120 }}>
                                    {levels.map((l) => (
                                        <Option key={l} value={l}>
                                            {l}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name='nd' rules={rules}>
                                <Input placeholder='Nội dung câu hỏi' style={{ width: 300 }} />
                            </Form.Item>
                            <Button htmlType='submit' type='primary'>
                                Thêm
                            </Button>
                        </Form>

                        <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 500 }}>Bộ lọc:</span>
                            <Select placeholder='Lọc theo Môn Học' allowClear style={{ width: 160 }} onChange={(val) => setFilterMon(val)}>
                                {data.mon.map((m: any) => (
                                    <Option key={m.id} value={m.id}>
                                        {m.ten}
                                    </Option>
                                ))}
                            </Select>
                            <Select placeholder='Lọc theo Khối KT' allowClear style={{ width: 160 }} onChange={(val) => setFilterKhoi(val)}>
                                {data.khoi.map((k: any) => (
                                    <Option key={k.id} value={k.id}>
                                        {k.ten}
                                    </Option>
                                ))}
                            </Select>
                            <Select placeholder='Lọc theo Mức độ' allowClear style={{ width: 140 }} onChange={(val) => setFilterMucDo(val)}>
                                {levels.map((l) => (
                                    <Option key={l} value={l}>
                                        {l}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <Table
                            size='small'
                            columns={[
                                { title: 'Mã CH', dataIndex: 'ma' },
                                {
                                    title: 'Môn Học',
                                    render: (_, record: any) => data.mon.find((m: any) => m.id === record.mon)?.ten,
                                },
                                {
                                    title: 'Khối Kiến Thức',
                                    render: (_, record: any) => data.khoi.find((k: any) => k.id === record.khoi)?.ten,
                                },
                                { title: 'Mức độ', dataIndex: 'mucDo' },
                                { title: 'Nội dung', dataIndex: 'nd' },
                            ]}
                            dataSource={getFilteredCauHoi()}
                            rowKey='id'
                        />
                    </Card>
                </TabPane>

                <TabPane tab='4. Đề Thi' key='4'>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={10}>
                            <Card title='Sinh Đề Thi Tự Động' size='small'>
                                <Form form={formDeThi} onFinish={handleGenerateDeThi} layout='vertical'>
                                    <Form.Item name='ten' label='Tên đề thi' rules={rules}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name='mon' label='Môn học' rules={rules}>
                                        <Select>
                                            {data.mon.map((m: any) => (
                                                <Option key={m.id} value={m.id}>
                                                    {m.ten}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <p style={{ fontWeight: 'bold' }}>Cấu trúc đề thi:</p>
                                    <Form.List name='cauTruc'>
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name }) => (
                                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                                                        <Form.Item name={[name, 'khoi']} rules={rules}>
                                                            <Select placeholder='Khối' style={{ width: 120 }}>
                                                                {data.khoi.map((k: any) => (
                                                                    <Option key={k.id} value={k.id}>
                                                                        {k.ten}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item name={[name, 'mucDo']} rules={rules}>
                                                            <Select placeholder='Độ khó' style={{ width: 100 }}>
                                                                {levels.map((l) => (
                                                                    <Option key={l} value={l}>
                                                                        {l}
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item name={[name, 'sl']} rules={rules}>
                                                            <InputNumber placeholder='SL' min={1} style={{ width: 80 }} />
                                                        </Form.Item>
                                                        <Button danger onClick={() => remove(name)}>
                                                            Xóa
                                                        </Button>
                                                    </Space>
                                                ))}
                                                <Button type='dashed' onClick={() => add()} block>
                                                    + Cấu trúc
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                    <Button type='primary' htmlType='submit' style={{ marginTop: 16 }} block>
                                        Sinh Đề Thi
                                    </Button>
                                </Form>
                            </Card>
                        </Col>
                        <Col xs={24} lg={14}>
                            <Card title='Danh Sách Đề Thi' size='small'>
                                <Table
                                    size='small'
                                    columns={[
                                        { title: 'Tên Đề', dataIndex: 'ten' },
                                        {
                                            title: 'Môn',
                                            render: (_, record: any) => data.mon.find((m: any) => m.id === record.mon)?.ten,
                                        },
                                        {
                                            title: 'Tổng số câu',
                                            render: (_, record: any) => record.cauHoi.length,
                                        },
                                        {
                                            title: 'Thao tác',
                                            render: (_, record: any) => (
                                                <Button
                                                    size='small'
                                                    type="primary"
                                                    onClick={() =>
                                                        Modal.info({
                                                            title: record.ten,
                                                            width: 600,
                                                            content: (
                                                                <div>
                                                                    {record.cauHoi.map((c: any, index: number) => (
                                                                        <p key={c.id}>
                                                                            <b>Câu {index + 1}:</b> {c.nd} <i>({c.mucDo})</i>
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            ),
                                                        })
                                                    }
                                                >
                                                    Chi Tiết
                                                </Button>
                                            ),
                                        },
                                    ]}
                                    dataSource={data.deThi}
                                    rowKey='id'
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default NganHangCauHoi;
