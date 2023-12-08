import { useDataEngine } from "@dhis2/app-runtime";

export const useDataStore = () => {
  const engine = useDataEngine();

  const getNameSpaces = async () => {
    const query = {
      dataStore: {
        resource: "dataStore",
        params: {
          fields: "id,name,displayName,namespace",
        },
      },
    };
    const { dataStore } = await engine.query(query);
    return dataStore;
  };

  const getKeys = async (namespace) => {
    const query = {
      dataStore: {
        resource: "dataStore/" + namespace,
        params: {
          fields: "id,key,name,displayName,namespace",
        },
      },
    };
    const { dataStore } = await engine.query(query);
    return dataStore;
  };

  const getValues = async (namespace, key) => {
    const query = {
      dataStore: {
        resource: "dataStore/" + namespace + "/" + key,
        params: {
          fields: "id,key,name,displayName,namespace,value",
        },
      },
    };
    const { dataStore } = await engine.query(query);
    return dataStore;
  };

  const createNamespace = async (namespace, key, data = []) => {
    const mutation = {
      resource: `dataStore/${namespace}/${key}`,
      type: "create",
      data,
    };
    await engine.mutate(mutation);
  };

  const updateNamespace = async (namespace, key, data = []) => {
    const mutation = {
      resource: `dataStore/${namespace}/${key}`,
      type: "update",
      data,
    };
    await engine.mutate(mutation);
  };

  return {
    getNameSpaces,
    getKeys,
    getValues,
    createNamespace,
    updateNamespace,
  };
};
