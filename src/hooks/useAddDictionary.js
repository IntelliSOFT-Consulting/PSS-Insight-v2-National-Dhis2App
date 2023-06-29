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
        aggregationType:
          data.valueType === ('TEXT' || 'CODED') ? 'COUNT' : 'SUM',
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
      aggregationType: datas.dataType === ('TEXT' || 'CODED') ? 'COUNT' : 'SUM',
    };
    dataElements.push(dataElement);

    return dataElements;
  };

  // format data elements for comments and uploads
  const formatDataElementsForCommentsAndUploads = dataElements => {
    const dataElementsForCommentsAndUploads = [];
    dataElements.forEach(dataElement => {
      const commentDataElement = {
        name: `${dataElement.code}_Comment`,
        shortName: `${dataElement.code}_Comment`,
        code: `${dataElement.code}_Comment`,
        domainType: 'TRACKER',
        valueType: 'TEXT',
        aggregationType: 'NONE',
      };
      const uploadDataElement = {
        name: `${dataElement.code}_Upload`,
        shortName: `${dataElement.code}_Upload`,
        code: `${dataElement.code}_Upload`,
        domainType: 'TRACKER',
        valueType: 'TEXT',
        aggregationType: 'NONE',
      };
      dataElementsForCommentsAndUploads.push(commentDataElement);
      dataElementsForCommentsAndUploads.push(uploadDataElement);
    });
    return dataElementsForCommentsAndUploads;
  };

  const formatAllDataElements = dictionary => {
    const dataElements = formatAssessmentQuestions(dictionary);
    const dataElementsForCommentsAndUploads =
      formatDataElementsForCommentsAndUploads(dataElements);
    return [...dataElements, ...dataElementsForCommentsAndUploads];
  };

  const createDataElements = async dictionary => {
    try {
      // setDictionary(dictionary);
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
      filter: formatExpression(
        dictionary.expression,
        dataElements,
        stages?.programs[0]?.programStages?.[0]?.id
      ),

      analyticsType: 'EVENT',
      aggregationType: dictionary.methodOfEstimation,
      analyticsPeriodBoundaries: [
        {
          boundaryTarget: 'EVENT_DATE',
          analyticsPeriodBoundaryType: 'AFTER_START_OF_REPORTING_PERIOD',
        },
        {
          boundaryTarget: 'EVENT_DATE',
          analyticsPeriodBoundaryType: 'BEFORE_END_OF_REPORTING_PERIOD',
        },
      ],
    };
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
