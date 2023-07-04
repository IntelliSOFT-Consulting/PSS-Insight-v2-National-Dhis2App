import { useState, useEffect } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { formatExpression, formatFormula } from '../utils/helpers';

export default function useAddDictionary() {
  const [stages, setStages] = useState(null);
  const [indicatorDescriptions, setIndicatorDescriptions] = useState(null);
  const [success, setSuccess] = useState(false);

  const engine = useDataEngine();

  const getIndicatorDescriptions = async () => {
    await engine.query(
      {
        dataStore: {
          resource: 'dataStore/Indicator_description',
          id: 'V1',
        },
      },
      {
        onComplete: async response => {
          const descriptions = response?.dataStore;
          setIndicatorDescriptions(descriptions);
        },
      }
    );
    return indicatorDescriptions;
  };

  const getStages = async () => {
    await engine.query(
      {
        programStages: {
          resource: 'programs',
          params: {
            filter: `name:ne:default`,
            fields: 'id,programStages[*]',
          },
        },
      },
      {
        onComplete: async response => {
          const stages = response?.programStages;
          setStages(stages);
        },
      }
    );

    return stages;
  };

  useEffect(() => {
    getStages();
    getIndicatorDescriptions();
  }, []);

  const dataElementFormatter = (dataElement, keyword) => ({
    name: `${dataElement.code}_${keyword}`,
    shortName: `${dataElement.code}_${keyword}`,
    code: `${dataElement.code}_${keyword}`,
    valueType: 'TEXT',
    aggregationType: 'NONE',
    domainType: 'TRACKER',
  });

  const addDataToStore = async (dictionary, elements) => {
    const storeData = Array.isArray(indicatorDescriptions)
      ? indicatorDescriptions
      : [];
    const updatedQuestions = await dictionary.assessmentQuestions.map(
      question => {
        const dataElement = elements.find(
          element => element.name === question.name
        );

        if (dataElement) {
          question.id = dataElement.id;
          question.code = dataElement.code;
        }
        return question;
      }
    );
    dictionary.assessmentQuestions = updatedQuestions;

    storeData.push(dictionary);
    await engine.mutate({
      resource: 'dataStore/Indicator_description/V1',
      type: 'update',
      data: storeData,
    });
  };

  // format assessment questions as data elements
  const formatAssessmentQuestions = datas => {
    const dataElements = [];
    datas.assessmentQuestions.forEach((data, index) => {
      const dataElement = {
        name: data.name,
        shortName: data.name,
        code: `${datas.indicatorCode}${String.fromCharCode(97 + index)}`,
        domainType: 'TRACKER',
        valueType: data.valueType?.replace('CODED', 'TEXT'),
        aggregationType: datas.methodOfEstimation,
      };
      if (data.optionSet) {
        dataElement.optionSet = {
          id: data.optionSet.id,
        };
      }
      dataElements.push(dataElement);
    });

    // create one more data element for the indicator code
    const dataElement = {
      name: datas.indicatorName,
      shortName: datas.indicatorName.substring(0, 50),
      code: datas.indicatorCode,
      domainType: 'TRACKER',
      valueType: datas.dataType?.replace('CODED', 'TEXT'),
      aggregationType: datas.methodOfEstimation,
    };

    dataElements.push(dataElement);

    return dataElements;
  };

  // format data elements for comments and uploads
  const formatDataElementsForCommentsAndUploads = dataElements => {
    const dataElementsForCommentsAndUploads = [];
    dataElements.forEach(dataElement => {
      const commentDataElement = dataElementFormatter(dataElement, 'Comment');
      const uploadDataElement = dataElementFormatter(dataElement, 'Upload');

      dataElementsForCommentsAndUploads.push(commentDataElement);
      dataElementsForCommentsAndUploads.push(uploadDataElement);
    });
    return dataElementsForCommentsAndUploads;
  };

  const formatAllDataElements = dictionary => {
    const dataElements = formatAssessmentQuestions(dictionary);
    const dataElementsForCommentsAndUploads =
      formatDataElementsForCommentsAndUploads(dataElements);
    // create a data element for the benchmark
    const benchmarkDataElement = {
      name: `${dictionary.indicatorCode}_Benchmark`,
      shortName: `${dictionary.indicatorCode}_Benchmark`,
      code: `${dictionary.indicatorCode}_Benchmark`,
      domainType: 'AGGREGATE',
      valueType: 'NUMBER',
      aggregationType: 'NONE',
    };
    return [
      ...dataElements,
      ...dataElementsForCommentsAndUploads,
      benchmarkDataElement,
    ];
  };

  const createDataElements = async dictionary => {
    try {
      const dataElements = createDictionary(dictionary);

      const elementNames = dataElements.map(element => element.name);

      const { response: dataElementResponse } = await engine.mutate({
        resource: 'metadata',
        type: 'create',
        data: { dataElements },
      });

      if (dataElementResponse) {
        await engine.query(
          {
            dataElements: {
              resource: 'dataElements',
              params: {
                filter: `name:in:[${elementNames.join(',')}]`,
                fields: 'id,name,code',
              },
            },
          },
          {
            onComplete: async ({ dataElements }) => {
              const datas = dataElements?.dataElements;

              // get dataElement with Benchmark
              const benchmarkDataElement = datas.find(
                dataElement =>
                  dataElement.name === `${dictionary.indicatorCode}_Benchmark`
              );

              // save dataValueSet for benchmark
              await engine.mutate({
                resource: 'dataValueSets',
                type: 'create',
                data: {
                  dataValues: [
                    {
                      dataElement: benchmarkDataElement.id,
                      value: dictionary.benchmark || 0,
                      period: new Date().toISOString().split('T')[0],
                      orgUnit: dictionary.orgUnit,
                    },
                  ],
                },
              });

              await addDataToStore(dictionary, datas);
              // add data elements to program

              await addDataElementsToProgram(dictionary, datas);
            },
          }
        );
        return dataElementResponse;
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const createDictionary = dictionary => {
    const dataElements = formatAllDataElements(dictionary);
    return dataElements;
  };

  const addDataElementsToProgram = async (dictionary, dataElements) => {
    // add data elements to program
    const programStage = stages?.programs?.[0]?.programStages?.[0];

    const currentStage = programStage?.id;
    const stageElements = [
      ...programStage.programStageDataElements,
      ...dataElements.map(element => ({
        dataElement: element,
      })),
    ];
    programStage.programStageDataElements = stageElements;
    const { response: programResponse } = await engine.mutate({
      resource: 'metadata',
      type: 'create',
      data: { programStages: [programStage] },
    });

    if (programResponse) {
      await createDataElementGroup(dictionary, dataElements);
      return programResponse;
    }
  };

  const createDataElementGroup = async (dictionary, dataElements) => {
    // create data element group

    const dataElementGroup = {
      name: dictionary.indicatorCode,
      shortName: dictionary.indicatorCode,
      code: dictionary.indicatorCode,
      dataElements: dataElements,
    };
    const { response: dataElementGroupResponse } = await engine.mutate({
      resource: 'dataElementGroups',
      type: 'create',
      data: dataElementGroup,
    });

    if (dataElementGroupResponse) {
      await createProgramIndicator(dictionary, dataElements);
    }

    return dataElementGroupResponse;
  };
  const createProgramIndicator = async (dictionary, dataElements) => {
    // create program indicator

    const programIndicator = {
      name: dictionary.indicatorName,
      shortName: dictionary.indicatorCode,
      code: dictionary.indicatorCode,
      program: { id: stages?.programs?.[0]?.id },
      expression: 'V{event_count}',
      displayInForm: true,

      analyticsType: 'EVENT',
      aggregationType: dictionary.methodOfEstimation,
      analyticsPeriodBoundaries: [
        {
          boundaryTarget: 'EVENT_DATE',
          analyticsPeriodBoundaryType: 'AFTER_START_OF_REPORTING_PERIOD',
          offsetPeriodType: 'Yearly',
        },
        {
          boundaryTarget: 'EVENT_DATE',
          analyticsPeriodBoundaryType: 'BEFORE_END_OF_REPORTING_PERIOD',
          offsetPeriodType: 'Yearly',
        },
      ],
    };
    if (dictionary.expression) {
      programIndicator.filter = formatExpression(
        dictionary.expression,
        dataElements,
        stages?.programs[0]?.programStages?.[0]?.id
      );
    }
    const { response: programIndicatorResponse } = await engine.mutate({
      resource: 'programIndicators',
      type: 'create',
      data: programIndicator,
    });

    if (programIndicatorResponse) {
      await createIndicator(dictionary, dataElements);
    }

    return programIndicatorResponse;
  };

  // create indicator
  const createIndicator = async (dictionary, dataElements) => {
    const indicator = {
      name: dictionary.indicatorCode,
      shortName: dictionary.indicatorCode,
      code: dictionary.indicatorCode,
      indicatorType: { id: dictionary.formula.format },
      numerator: formatFormula(dictionary.formula.numerator, dataElements),
      denominator: formatFormula(dictionary.formula.denominator, dataElements),
    };

    const { response: indicatorResponse } = await engine.mutate({
      resource: 'indicators',
      type: 'create',
      data: indicator,
    });

    if (indicatorResponse) {
      setSuccess(true);
    }

    return indicatorResponse;
  };

  return {
    createDataElements,
    success,
  };
}
