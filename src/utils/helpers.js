export const toSentenceCase = str => {
  return str
    ?.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const sortIndicators = indicators => {
  const sorted = indicators.map(category => {
    const sortedIndicators = category.indicators.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
    const sortedDataValues = sortedIndicators.map(indicator => {
      const sortedDataValues = indicator.indicatorDataValue.sort((a, b) =>
        a.code.localeCompare(b.code)
      );
      return { ...indicator, indicatorDataValue: sortedDataValues };
    });
    return { ...category, indicators: sortedDataValues };
  });
  return sorted;
};

export const groupIndicatorsByVersion = indicators => {
  const versionedIndicators = indicators.reduce((acc, indicator) => {
    const { version, indicators } = indicator;
    const referenceSheet = indicators?.referenceSheet;
    const versionedIndicators = indicators.details.map(detail => {
      const { categoryName, indicators } = detail;
      return {
        categoryName,
        referenceSheet,
        indicators: indicators.map(indicator => ({
          ...indicator,
          version,
        })),
      };
    });
    return [...acc, ...versionedIndicators];
  }, []);

  const groupedIndicators = versionedIndicators.reduce((acc, indicator) => {
    const { categoryName, indicators, referenceSheet } = indicator;
    const existingCategory = acc.find(
      category => category.categoryName === categoryName
    );
    if (existingCategory) {
      existingCategory.indicators = [
        ...existingCategory.indicators,
        ...indicators,
      ];
    } else {
      acc.push({ categoryName, referenceSheet, indicators });
    }
    return acc;
  }, []);

  const sortedGroupedIndicators = groupedIndicators.map(group => {
    const { categoryName, indicators, referenceSheet } = group;
    const sortedIndicators = indicators.sort((a, b) => {
      if (a.categoryName === b.categoryName) {
        return b.version - a.version;
      }

      const nameA = a.categoryName?.toUpperCase();
      const nameB = b.categoryName?.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    const sortedIndicatorDataValue = sortedIndicators.map(indicator => {
      const { indicatorDataValue } = indicator;
      const sortedIndicatorValue = indicatorDataValue.sort((a, b) => {
        const codeA = a.code?.toUpperCase();
        const codeB = b.code?.toUpperCase();
        if (codeA < codeB) {
          return -1;
        }
        if (codeA > codeB) {
          return 1;
        }
        return 0;
      });
      return {
        ...indicator,
        indicatorDataValue: sortedIndicatorValue,
      };
    });

    return {
      categoryName,
      referenceSheet,
      indicators: sortedIndicatorDataValue.map(indicator => ({
        ...indicator,
        isLatestVersion: indicator.version === sortedIndicators[0].version,
        categoryId:
          indicator.version === sortedIndicators[0].version
            ? `${indicator.categoryId}-latest`
            : `${indicator.categoryId}-${indicator.version}`,
      })),
    };
  });

  return sortedGroupedIndicators;
};

export const formatLatestId = (id = '') => {
  if (id.endsWith('-latest')) {
    return { id: id.split('-')[0], lisLatest: true };
  }
  return { id: id.split('-')[0], isLatest: false };
};

export const formatVersionDetails = (versionDetails = {}) => {
  const { indicators } = versionDetails;
  const indicatorIds = indicators.details
    ?.map(indicator => {
      return indicator?.indicators.map(item => ({
        id: item.categoryId,
        isLatest: item?.isLatest === undefined ? true : item?.isLatest,
      }));
    })
    .flat();
  const obj = {
    versionName: versionDetails.versionName,
    versionDescription: versionDetails.versionDescription,
    status: versionDetails.status,
    createdBy: versionDetails.createdBy,
  };

  obj.indicators = indicatorIds;

  return obj;
};

const compareIds = (id1, id2) => {
  const [name1, version1] = id1.split('-');
  const [name2, version2] = id2.split('-');
  return name1 === name2 && version1 !== version2;
};
export const checkDisable = (categoryId, selected) => {
  const id = categoryId.split('-')[0];
  const latest = categoryId.endsWith('-latest');
  const checkSelected = selected.find(item => item.id === id);
  return checkSelected && latest !== checkSelected?.isLatest;
};

export const displayDetails = surveyDetails => {
  const { questions, responses, indicators } = surveyDetails;

  const mainQuestions = questions || indicators.details;
  const newQuestions = mainQuestions.map(question => {
    const { indicators } = question;
    const newIndicators = indicators.map(indicator => {
      const { indicatorDataValue } = indicator;
      const newIndicatorDataValue = indicatorDataValue.map(indicatorData => {
        const { id } = indicatorData;
        const response = responses.find(response => response.indicator === id);
        if (!response) return indicatorData;
        delete response.indicator;
        return { ...indicatorData, ...response };
      });
      return { ...indicator, indicatorDataValue: newIndicatorDataValue };
    });
    return { ...question, indicators: newIndicators };
  });
  return newQuestions;
};

export const formatSurveyDetails = surveyDetails => {
  const { name, description, landingPage, indicators } = surveyDetails;
  const newIndicators = indicators.reduce((acc, indicator) => {
    const { indicators } = indicator;
    const newIndicators = indicators.reduce((acc, indicator) => {
      const { categoryId } = indicator;
      return { ...acc, [categoryId]: categoryId };
    }, {});
    return { ...acc, ...newIndicators };
  }, {});
  return {
    surveyName: name,
    surveyDescription: description,
    surveyLandingPage: landingPage,
    ...newIndicators,
  };
};

export const sortSurveys = surveys => {
  return surveys.sort((a, b) => b.surveyId - a.surveyId);
};

export const sortByDate = arr => {
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const formatFormulaByIndex = (formula, questions) => {
  const variableRegex = /\{([^}]+)\}/g;

  const replacedFormula = formula?.replace(variableRegex, (match, name) => {
    const index = questions?.findIndex(q => q.name === name.trim());
    return index >= 0 ? `{${index.toString()}}` : '0';
  });

  return replacedFormula;
};
