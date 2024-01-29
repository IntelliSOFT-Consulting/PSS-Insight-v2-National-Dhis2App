import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { useDataStore } from "../hooks/useDataStore";
import { Form, Switch, Spin } from "antd";
import Info from "../components/Info";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  mt: {
    marginTop: "1rem",
  },
});

export default function SyncConfig() {
  const [loading, setLoading] = useState(true);
  const { getValues, createNamespace, updateNamespace } = useDataStore();

  const [form] = Form.useForm();

  const classes = useStyles();

  const getSyncConfig = async () => {
    try {
      const syncConfig = await getValues("configurations", "sync_configs");
      form.setFieldValue("sync_to_international", syncConfig.sync_to_international);
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
      await updateNamespace("configurations", "sync_configs", values);
    } catch (e) {
      await createNamespace("configurations", "sync_configs", values);
    } finally {
      await getSyncConfig();
    }
  };

  return (
    <Card title="SYNC TO INTERNATIONAL INSTANCE">
      <Spin spinning={loading}>
        <Info
          message={`The sync option should be set ON for country instance that has allowed shared data directly with the International/Global instance. Otherwise, for a country with data governance policy that doesn't allow sharing of the data it should be tuned off.`}
        />
        <Form form={form} layout="vertical" className={classes.mt}>
          <Form.Item name="sync_to_international" label="Sync to International Instance" valuePropName="checked">
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
