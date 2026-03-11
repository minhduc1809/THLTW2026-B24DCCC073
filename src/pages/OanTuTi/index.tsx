import React, { useState } from 'react';
import { Button, Card, Col, Row, Space, Typography, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

const { Title, Text } = Typography;

type Choice = 'Kéo' | 'Búa' | 'Bao';
type Result = 'Thắng' | 'Thua' | 'Hòa';

interface GameRecord {
    key: string;
    round: number;
    playerChoice: Choice;
    computerChoice: Choice;
    result: Result;
    time: string;
}

const choices: Choice[] = ['Kéo', 'Búa', 'Bao'];

const OanTuTi: React.FC = () => {
    const [history, setHistory] = useState<GameRecord[]>([]);
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [currentResult, setCurrentResult] = useState<Result | null>(null);

    const [score, setScore] = useState({
        wins: 0,
        losses: 0,
        draws: 0,
    });

    const determineWinner = (player: Choice, computer: Choice): Result => {
        if (player === computer) return 'Hòa';
        if (
            (player === 'Kéo' && computer === 'Bao') ||
            (player === 'Búa' && computer === 'Kéo') ||
            (player === 'Bao' && computer === 'Búa')
        ) {
            return 'Thắng';
        }
        return 'Thua';
    };

    const playGame = (choice: Choice) => {
        const randomIdx = Math.floor(Math.random() * 3);
        const compChoice = choices[randomIdx];
        const result = determineWinner(choice, compChoice);

        setPlayerChoice(choice);
        setComputerChoice(compChoice);
        setCurrentResult(result);

        setScore((prev) => ({
            wins: prev.wins + (result === 'Thắng' ? 1 : 0),
            losses: prev.losses + (result === 'Thua' ? 1 : 0),
            draws: prev.draws + (result === 'Hòa' ? 1 : 0),
        }));

        const newRecord: GameRecord = {
            key: new Date().getTime().toString(),
            round: history.length + 1,
            playerChoice: choice,
            computerChoice: compChoice,
            result,
            time: new Date().toLocaleTimeString(),
        };
        setHistory([newRecord, ...history]);
    };

    const columns: ColumnsType<GameRecord> = [
        { title: 'Lượt', dataIndex: 'round', key: 'round' },
        { title: 'Thời gian', dataIndex: 'time', key: 'time' },
        { title: 'Bạn Chọn', dataIndex: 'playerChoice', key: 'playerChoice' },
        { title: 'Máy Chọn', dataIndex: 'computerChoice', key: 'computerChoice' },
        { title: 'Kết quả', dataIndex: 'result', key: 'result' },
    ];

    return (
        <div>
            <Card title={<Title level={3}>Trò Chơi Oẳn Tù Tì</Title>}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Card title='Bảng Điều Khiển'>
                            <div>
                                <Title level={4}>Lựa Chọn Của Bạn</Title>
                                <Space>
                                    <Button type='primary' onClick={() => playGame('Kéo')}>KÉO</Button>
                                    <Button danger type='primary' onClick={() => playGame('Búa')}>BÚA</Button>
                                    <Button onClick={() => playGame('Bao')}>BAO</Button>
                                </Space>
                            </div>
                            <br />
                            {(playerChoice || computerChoice) && (
                                <div>
                                    <Row>
                                        <Col span={8}>
                                            <Text strong>Bạn: </Text>
                                            <Text>{playerChoice}</Text>
                                        </Col>
                                        <Col span={8}>
                                            <Title level={4}>{currentResult}</Title>
                                        </Col>
                                        <Col span={8}>
                                            <Text strong>Máy: </Text>
                                            <Text>{computerChoice}</Text>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </Card>
                        <br />
                        <Card title='Thống Kê'>
                            <Row>
                                <Col span={8}>
                                    <Title level={4}>{score.wins}</Title>
                                    <Text>Thắng</Text>
                                </Col>
                                <Col span={8}>
                                    <Title level={4}>{score.losses}</Title>
                                    <Text>Thua</Text>
                                </Col>
                                <Col span={8}>
                                    <Title level={4}>{score.draws}</Title>
                                    <Text>Hòa</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title='Lịch Sử Trận Đấu'>
                            <Table columns={columns} dataSource={history} pagination={{ pageSize: 5 }} />
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default OanTuTi;
