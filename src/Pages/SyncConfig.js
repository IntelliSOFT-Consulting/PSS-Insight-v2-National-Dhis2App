import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { useDataStore } from "../hooks/useDataStore";
import { Button, Form, Switch, Spin } from "antd";

export default function SyncConfig() {
  const [loading, setLoading] = useState(true);
  const { getValues, createNamespace, updateNamespace } = useDataStore();

  const [form] = Form.useForm();

  const getSyncConfig = async () => {
    try {
      const syncConfig = await getValues("configurations", "configs");
      form.setFieldValue(
        "sync_to_international",
        syncConfig.sync_to_international
      );
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSyncConfig();
  }, []);

  const handleSave = async (values) => {
    console.log(values);
    try {
      setLoading(true);
      await updateNamespace("configurations", "configs", values);
    } catch (e) {
      await createNamespace("configurations", "configs", values);
    } finally {
      await getSyncConfig();
    }
  };

  return (
    <Card title="SYNC TO INTERNATIONAL INSTANCE">
      <Spin spinning={loading}>
        <Form form={form} layout='vertical'>
          <Form.Item
            name="sync_to_international"
            label="Sync to International Instance"
            valuePropName="checked"
          >
            <Switch
              onChange={async (value) => {
                await handleSave({
                  sync_to_international: value,
                });
              }}
              checkedChildren="ON"
                unCheckedChildren="OFF"
            />
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
}
