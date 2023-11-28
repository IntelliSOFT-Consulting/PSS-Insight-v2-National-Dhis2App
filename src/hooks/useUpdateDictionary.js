import { useState, useEffect } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function useUpdateDictionary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const engine = useDataEngine();

  const fetchDataStore = async () => {
    const { dataStore } = await engine.query({
      dataStore: {
        resource: "dataStore/Indicator_description",
        id: "V1",
      },
    });
    return dataStore;
  };

  const getProgram = async () => {
    const { programs } = await engine.query({
      programs: {
        resource: "programs",
        params: {
          fields: "id,name,programStages[*]",
          filter: `name:ilike:pss`,
        },
      },
    });
    return programs?.programs?.[0];
  };

  const createDataElement = (name, code, domainType, valueType, optionSet = null) => {
    const de = {
      name,
      shortName: name,
      code,
      domainType,
      valueType,
      aggregationType: "NONE",
    };

    if (optionSet) {
      de.optionSet = {
        id: optionSet.id,
      };
    }

    return de;
  };
  const updateDataElements = async (prevDictionary, currentDictionary) => {
    const dataElementNames = currentDictionary?.assessmentQuestions?.map((question) => question.name);
    const prevDataElementNames = prevDictionary?.assessmentQuestions?.map((question) => question.name);

    const dataElementsToAdd = dataElementNames?.filter((name) => !prevDataElementNames?.includes(name));
    let dataElementsToUpdate = dataElementNames?.filter((name) => prevDataElementNames?.includes(name));

    dataElementsToUpdate = [
      {
        name: currentDictionary?.indicatorName,
        valueType: currentDictionary?.dataType?.replace("CODED", "TEXT"),
      },
    ];

    const newElements = dataElementsToAdd?.map((name) => {
      const question = currentDictionary.assessmentQuestions.find((question) => question.name === name);
      return createDataElement(question.name, question.code, "TRACKER", "TEXT", question.optionSet);
    });

    //   create new data elements
    if (newElements?.length > 0) {
      const payload = newElements.map((element) =>
        createDataElement(element.name, element.code, element.domainType, element.valueType, element.optionSet)
      );
      await engine.mutate({
        resource: "dataElements",
        type: "create",
        data: {
          dataElements: payload,
        },
      });
    }

    // update existing data elements
    if (dataElementsToUpdate?.length > 0) {
      const { dataElements } = await engine.query({
        dataElements: {
          resource: "dataElements",
          params: {
            fields: "*",
            filter: `name:in:[${dataElementsToUpdate
              ?.map((item) => item.name)
              ?.filter(Boolean)
              .join(",")}]`,
          },
        },
      });

      const elements = dataElements?.dataElements?.map((element) => {
        const question = dataElementsToUpdate.find(
          (question) => question.name === element.code || currentDictionary?.indicatorCode === element.code
        );
        return {
          ...element,
          name: question?.name,
        };
      });

      const updated = await Promise.all(
        elements?.map(async (element) => {
          await engine.mutate({
            resource: "dataElements",
            id: element.id,
            mergeMode: "REPLACE",
            type: "update",
            data: {
              ...element,
              name: element.name,
            },
          });
        })
      );
    }

    //   get the new data elements and update the dictionary
    const updatedDataElements = await engine.query({
      dataElements: {
        resource: "dataElements",
        params: {
          fields: "id,name,optionSet,code,valueType,aggregationType,optionSet[id,name,options[id,name]]",
          filter: `name:in:[${dataElementNames.join(",")}]`,
        },
      },
    });
    return updatedDataElements?.dataElements?.dataElements;
  };

  const updateProgramIndicator = async (dictionary, dataElements, program) => {
    let expression = dictionary.expression?.replace(/{/g, "#{")?.replace(/}/g, "}");
    // replace data element names with their corresponding ids
    dataElements.forEach((dataElement) => {
      expression = expression?.replace(new RegExp(dataElement.name, "g"), `${program.id}.${dataElement.id}`);
    });

    const getProgramIndicator = async () => {
      const { programIndicators } = await engine.query({
        programIndicators: {
          resource: "programIndicators",
          params: {
            fields: "*",
            filter: `code:eq:${dictionary.indicatorCode}`,
          },
        },
      });
      return programIndicators?.programIndicators?.[0];
    };

    const programIndicator = await getProgramIndicator();
    if (programIndicator) {
      await engine.mutate({
        resource: "programIndicators",
        id: programIndicator.id,
        type: "update",
        data: {
          ...programIndicator,
          name: dictionary.indicatorName,
          expression,
        },
      });
    }
  };

  const updateIndicator = async (dictionary, dataElements, program) => {
    let expression = dictionary.expression?.replace(/{/g, "#{")?.replace(/}/g, "}");
    // replace data element names with their corresponding ids
    dataElements.forEach((dataElement) => {
      expression = expression?.replace(new RegExp(dataElement.name, "g"), `${program.id}.${dataElement.id}`);
    });

    const getIndicator = async () => {
      const { indicators } = await engine.query({
        indicators: {
          resource: "indicators",
          params: {
            fields: "*",
            filter: `code:eq:${dictionary.indicatorCode}`,
          },
        },
      });
      return indicators?.indicators?.[0];
    };

    const indicator = await getIndicator();
    if (indicator) {
      await engine.mutate({
        resource: "indicators",
        id: indicator.id,
        type: "update",
        data: {
          ...indicator,
          name: dictionary.indicatorName,
          expression,
        },
      });
    }
  };

  const updateDataStore = async (dictionary) => {
    const dataStore = await fetchDataStore();
    const updatedDataStore = dataStore?.map((item) => {
      if (item.indicatorCode === dictionary.indicatorCode) {
        return dictionary;
      }
      return item;
    });

    await engine.mutate({
      resource: "dataStore/Indicator_description",
      id: "V1",
      type: "update",
      data: updatedDataStore,
    });

    return updatedDataStore;
  };

  const updateDictionary = async (prevDictionary, currentDictionary) => {
    try {
      const program = await getProgram();
      const dataElements = await updateDataElements(prevDictionary, currentDictionary);
      await updateProgramIndicator(currentDictionary, dataElements, program);
      await updateIndicator(currentDictionary, dataElements, program);
      currentDictionary.assessmentQuestions = dataElements;
      await updateDataStore(currentDictionary);

      return true;
    } catch (e) {
      throw new Error(e);
    }
  };

  return {
    updateDictionary,
    loading,
    error,
  };
}
