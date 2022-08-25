import { useAccount, useMsal } from "@azure/msal-react";
import { Card, Typography, Steps, Form, Select, BackTop, Button, Input, Space, Checkbox, Radio } from "antd";
import { UpCircleOutlined } from "@ant-design/icons";
import React, { CSSProperties, useState } from 'react';
import { Navigate } from "react-router-dom";
import TextArea from "antd/lib/input/TextArea";

const { Title } = Typography;
const { Step } = Steps;

const Sandbox: React.FC  = () => {
  const [current, setCurrent] = useState(0);
  const onChange = (value: number) => {
    console.log('onChange:', current);
    setCurrent(value);
  };
  const [fireRedirect] = useState<boolean>(false);
  //const [createLoading, setCreateLoading] = useState<boolean>(false);

  const [form] = Form.useForm();
  const { Option } = Select;
  const styling: CSSProperties = { width: "92%" };

  const DataScientist = "Data Scientist";
  const DataEngineer = "Data Engineer";
  const GeneralUser = "Genera User";


  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const editMode = true;

  const onClickSave = async () => {
    console.log("mock, save form to db")
  };
  return (
    <div className="page">
      <Card>
        <Title level={2}>Hi, {account?.name}</Title>
        <Title level={4}>Welcome to the Feathr Sandbox Page!</Title>
      </Card>
      <Card>
        <Title level={4}>Please follow the steps to get Free Trial Access</Title>  
        <Steps current={current} onChange={onChange}>
            <Step title="Step 1" description="Fill in Request Form" />
            <Step title="Step 2" description="Wait for Provision" />
            <Step title="Step 3" description="Connect to VM" />
            <Step title="Step 4" description="Follow Lab Guide" />
        </Steps>
      </Card>
      <Card>
      <>
      <Form
        form={form}
        style={styling}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 24 }}
        layout="horizontal"
        initialValues={{ remember: true }}
      >
        <Space direction="vertical" size="large" style={styling}>
          <Form.Item
            name="orgName"
            label="Organization Name"
            rules={[{ required: true }]}
          >
            <Input disabled={!editMode} placeholder="The organization or company you belong to" maxLength={100}/>
          </Form.Item>
          <Form.Item
            name="roleName"
            label="You Role"
            rules={[{ required: true }]}
          >
            <Radio.Group>
                <Radio value={GeneralUser}> {GeneralUser} </Radio>
                <Radio value={DataScientist}> {DataScientist} </Radio>
                <Radio value={DataEngineer}> {DataEngineer} </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="useCase" label="Use Case" rules={[{ required: true }]}>
            <TextArea rows={5} disabled={!editMode} placeholder="Please Describe Your Use Case of Feature Store" showCount maxLength={1000}  />
          </Form.Item>
          <Checkbox checked={true}>Do you want to be contact by Feathr Contributor Team?</Checkbox>
        </Space>
        <Form.Item wrapperCol={{ offset: 11 }}>
          <Button
            type="primary"
            htmlType="button"
            title="submit and go back to list"
            style={{ float: "inline-start" }}
            onClick={onClickSave}
            loading={createLoading}
            disabled={!editMode}
          >
            Submit
          </Button>
        </Form.Item>
        <BackTop style={{ marginBottom: "5%", marginRight: "20px" }}>
          <UpCircleOutlined style={{ fontSize: "400%", color: "#3F51B5" }} />
        </BackTop>
      </Form>
      {fireRedirect && <Navigate to={"/management"}></Navigate>}
    </>
      </Card>
    </div>
  );
};

export default Sandbox;