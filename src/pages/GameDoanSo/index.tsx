import { Card, InputNumber, Button, Typography, Space, message, Row, Col, Statistic } from 'antd';
import React, { useState, useEffect } from 'react';

const { Title, Text } = Typography;

const GameDoanSo: React.FC = () => {
    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [guess, setGuess] = useState<number | null>(null);
    const [attempts, setAttempts] = useState<number>(10);
    const [messageFeedback, setMessageFeedback] = useState<string>('');
    const [gameOver, setGameOver] = useState<boolean>(false);

    const initGame = () => {
        setTargetNumber(Math.floor(Math.random() * 100) + 1);
        setGuess(null);
        setAttempts(10);
        setMessageFeedback('');
        setGameOver(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    const handleGuess = () => {
        if (guess === null) {
            message.warning('Vui lòng nhập một số!');
            return;
        }

        if (gameOver) return;

        const newAttempts = attempts - 1;
        setAttempts(newAttempts);

        if (guess === targetNumber) {
            setMessageFeedback('Chúc mừng! Bạn đã đoán đúng!');
            setGameOver(true);
            message.success('Thắng rồi!');
        } else if (guess < targetNumber) {
            setMessageFeedback('Bạn đoán quá thấp!');
            if (newAttempts === 0) {
                setMessageFeedback(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
                setGameOver(true);
            }
        } else if (guess > targetNumber) {
            setMessageFeedback('Bạn đoán quá cao!');
            if (newAttempts === 0) {
                setMessageFeedback(`Bạn đã hết lượt! Số đúng là ${targetNumber}.`);
                setGameOver(true);
            }
        }
    };

    return (
        <Row justify="center">
            <Col xs={24} sm={16} md={12} lg={8}>
                <Card title={<Title level={3}>Game Đoán Số (1-100)</Title>} bordered={false}>
                    <div>
                        <Statistic title="Số lượt còn lại" value={attempts} valueStyle={{ color: attempts <= 3 ? '#cf1322' : '#3f8600' }} />
                    </div>

                    <Space direction="vertical" size="large">
                        <InputNumber

                            size="large"
                            min={1}
                            max={100}
                            placeholder="Nhập số dự đoán của bạn"
                            value={guess}
                            onChange={(value) => setGuess(value)}
                            disabled={gameOver}
                            onPressEnter={handleGuess}
                        />

                        <Button type="primary" size="large" block onClick={handleGuess} disabled={gameOver}>
                            Đoán
                        </Button>

                        {messageFeedback && (
                            <div>
                                <Text strong>
                                    {messageFeedback}
                                </Text>
                            </div>
                        )}

                        {gameOver && (
                            <Button size="large" block onClick={initGame}>
                                Chơi Lại
                            </Button>
                        )}
                    </Space>
                </Card>
            </Col>
        </Row>
    );
};

export default GameDoanSo;
