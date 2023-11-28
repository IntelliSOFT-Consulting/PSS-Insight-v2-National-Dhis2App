import { useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export default function useAddDictionary() {
  const [dictionary, setDictionary] = useState(null);
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

  const createDataElements = async (dictionary) => {
    const createDataElement = (
      name,
      code,
      domainType,
      valueType,
      optionSet = null
    ) => {
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

    const trackerDataElements = dictionary.assessmentQuestions?.map(
      (question, index) =>
        createDataElement(
          question.name,
          `${dictionary.indicatorCode}${String.fromCharCode(97 + index)}`,
          "TRACKER",
          question.valueType?.replace("CODED", "TEXT"),
          question.optionSet
        )
    );

    const aggregateDataElement = createDataElement(
      `${dictionary.indicatorName}_Benchmark`,
      `${dictionary.indicatorCode}_Benchmark`,
      "AGGREGATE",
      "NUMBER"
    );

    const indicatorDataElement = createDataElement(
      dictionary.indicatorName,
      dictionary.indicatorCode,
      "TRACKER",
      dictionary.dataType?.replace("CODED", "TEXT")
    );

    const dataElements = [
      indicatorDataElement,
      ...trackerDataElements,
      aggregateDataElement,
    ];

    const { response } = await engine.mutate({
      resource: "metadata",
      type: "create",
      data: { dataElements },
    });

    if (response) {
      // get data element ids using a query
      const { dataElements: createdDataElements } = await engine.query({
        dataElements: {
          resource: "dataElements",
          params: {
            fields: "id,name,code,valueType,optionSet[id,name,options[id,name]]",
            filter: `code:in:[${dataElements
              .map((dataElement) => dataElement.code)
              .join(",")}]`,
          },
        },
      });

      return createdDataElements?.dataElements;
    }
  };

  const deleteDataElements = async (dataElements) => {
    const { response } = await engine.mutate({
      resource: "metadata",
      type: "delete",
      data: {
        dataElements: dataElements.map((dataElement) => ({
          id: dataElement.id,
        })),
      },
    });

    return response?.importSummaries?.map((summary) => summary.reference);
  };

  const addDataElementsToProgram = async (dataElements, program) => {
    try {
      const { response } = await engine.mutate({
        resource: "metadata",
        // id: program.id,
        type: "create",
        data: {
          programStages: [
            {
              ...program.programStages[0],
              programStageDataElements: [
                ...program.programStages[0].programStageDataElements,
                ...dataElements?.map((dataElement) => ({
                  dataElement: {
                    id: dataElement.id,
                  },
                  compulsory: false,
                  allowProvidedElsewhere: false,
                  displayInReports: true,
                })),
              ],
            },
          ],
        },
      });

      return response?.importSummaries?.[0]?.reference;
    } catch (e) {
      // await deleteDataElements(dataElements);
      console.log("error with adding to program: ", e);
      throw new Error("Failed to add data elements to program");
    }
  };

  const removeDataElementsFromProgram = async (dataElements, program) => {
    const { response } = await engine.mutate({
      resource: "metadata",
      type: "post",
      data: {
        ...program,
        programStages: [
          {
            ...program.programStages[0],
            programStageDataElements: [
              ...program.programStages[0].programStageDataElements.filter(
                (programStageDataElement) =>
                  !dataElements.find(
                    (dataElement) =>
                      dataElement.id === programStageDataElement.dataElement.id
                  )
              ),
            ],
          },
        ],
      },
    });

    return response?.importSummaries?.[0]?.reference;
  };

  const createProgramIndicator = async (dictionary, dataElements, program) => {
    try {
      let expression = dictionary.expression
        ?.replace(/{/g, "#{")
        ?.replace(/}/g, "}");
      // replace data element names with their corresponding ids
      dataElements.forEach((dataElement) => {
        expression = expression?.replace(
          new RegExp(dataElement.name, "g"),
          `${program.id}.${dataElement.id}`
        );
      });

      const { response } = await engine.mutate({
        resource: "programIndicators",
        type: "create",
        data: {
          name: dictionary.indicatorName,
          shortName: dictionary.indicatorCode,
          code: dictionary.indicatorCode,
          expression,
          analyticsType: "EVENT",
          program: { id: program.id },
          // filter: dictionary.filter,
          displayDescription: dictionary.definition,
          displayShortName: dictionary.indicatorName,
          displayInForm: true,
          dataElementDimensions: dataElements,
        },
      });

      return response?.importSummaries?.[0]?.reference;
    } catch (e) {
      console.log("error with creating program indicator: ", e);
      await removeDataElementsFromProgram(dataElements, program);
      await deleteDataElements(dataElements);
      throw new Error("Failed to remove data elements from program");
    }
  };

  const deleteProgramIndicator = async () => {
    const { programIndicator } = await engine.query({
      programIndicator: {
        resource: "programIndicators",
        params: {
          fields: "id",
          filter: `code:eq:${dictionary.indicatorCode}`,
        },
      },
    });

    if (!programIndicator?.[0]?.id) return;

    const { response } = await engine.mutate({
      resource: "programIndicators",
      type: "delete",
      data: {
        programIndicators: programIndicator?.[0]?.id,
      },
    });

    return response?.importSummaries?.[0]?.reference;
  };

  const createIndicator = async (dictionary, dataElements, program) => {
    try {
      let numerator = dictionary?.formula?.numerator
        ?.replace(/{/g, "#{")
        ?.replace(/}/g, "}");

      let denominator = dictionary?.formula?.denominator
        ?.replace(/{/g, "#{")
        ?.replace(/}/g, "}");

      // replace data element names with their corresponding ids
      dataElements.forEach((dataElement) => {
        numerator = numerator.replace(
          new RegExp(dataElement.name, "g"),
          `${program.id}.${dataElement.id}`
        );
        denominator = denominator.replace(
          new RegExp(dataElement.name, "g"),
          `${program.id}.${dataElement.id}`
        );
      });

      const { response } = await engine.mutate({
        resource: "indicators",
        type: "create",
        data: {
          name: dictionary.indicatorName,
          shortName: dictionary.indicatorName,
          code: dictionary.indicatorCode,
          numerator,
          denominator,
          annualized: true,
          displayDescription: dictionary.definition,
          displayShortName: dictionary.indicatorName,
          displayInForm: true,
          indicatorType: { id: dictionary?.formula?.format },
          dataElementDimensions: [
            {
              id: `${dictionary.indicatorCode}_Benchmark`,
              name: `${dictionary.indicatorName}_Benchmark`,
            },
          ],
        },
      });

      return response?.importSummaries?.[0]?.reference;
    } catch (e) {
      console.log("error with creating indicator: ", e);
      await removeDataElementsFromProgram(dataElements, program);
      await deleteDataElements(dataElements);
      await deleteProgramIndicator();
      throw new Error("Failed to create indicator");
    }
  };

  const deleteIndicator = async (indicator) => {
    const { response } = await engine.mutate({
      resource: "indicators",
      type: "delete",
      data: {
        indicators: [{ id: indicator }],
      },
    });

    return response?.importSummaries?.[0]?.reference;
  };

  const updateDataStore = async (dataStore, dictionary, dataElements) => {
    try {
      dictionary.assessmentQuestions = dataElements;
      const { response } = await engine.mutate({
        resource: "dataStore/Indicator_description",
        type: "update",
        id: "V1",
        data: [...dataStore, dictionary],
      });
      return response;
    } catch (e) {
      console.log("error with updating data store: ", e);
      await removeDataElementsFromProgram(dataElements, program);
      await deleteDataElements(dataElements);
      await deleteProgramIndicator();
      await deleteIndicator();
      throw new Error("Failed to update data store");
    }
  };

  const addDictionary = async (dictionary) => {
    setLoading(true);
    try {
      const program = await getProgram();
      const dataStore = await fetchDataStore();
      const dataElements = await createDataElements(dictionary);

      const programStage = await addDataElementsToProgram(
        dataElements,
        program
      );
      const programIndicator = await createProgramIndicator(
        dictionary,
        dataElements,
        program
      );
      const indicator = await createIndicator(
        dictionary,
        dataElements,
        program
      );
      const updatedDataStore = await updateDataStore(
        dataStore,
        dictionary,
        dataElements
      );

      return {
        programStage,
        programIndicator,
        indicator,
        updatedDataStore,
      };
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return { addDictionary, loading, error };
}
