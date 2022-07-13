import React from 'react';
import { Card, Typography } from 'antd';
import { useParams } from "react-router-dom";

const { Title } = Typography;
type Params = {
    status: string;
    message: string
  }

const Exception: React.FC = () => {
    const { status, message } = useParams() as Params;

    return (
        <div className="page">
        <Card style={ { minWidth: '1000px' } }>
          <Title level={ 3 }>Exception</Title>
          <p> Api call returns exception: { status } : {message}</p>
        </Card>
      </div>
      );
}

export default Exception;