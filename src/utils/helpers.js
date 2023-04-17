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
    const versionedIndicators = indicators.details.map(detail => {
      const { categoryName, indicators } = detail;
      return {
        categoryName,
        indicators: indicators.map(indicator => ({
          ...indicator,
          version,
        })),
      };
    });
    return [...acc, ...versionedIndicators];
  }, []);

  const groupedIndicators = versionedIndicators.reduce((acc, indicator) => {
    const { categoryName, indicators } = indicator;
    const existingCategory = acc.find(
      category => category.categoryName === categoryName
    );
    if (existingCategory) {
      existingCategory.indicators = [
        ...existingCategory.indicators,
        ...indicators,
      ];
    } else {
      acc.push({ categoryName, indicators });
    }
    return acc;
  }, []);

  const sortedGroupedIndicators = groupedIndicators.map(group => {
    const { categoryName, indicators } = group;
    const sortedIndicators = indicators.sort((a, b) => {
      if (a.categoryName === b.categoryName) {
        return b.version - a.version;
      }

      const nameA = a.categoryName.toUpperCase();
      const nameB = b.categoryName.toUpperCase();
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
        const codeA = a.code.toUpperCase();
        const codeB = b.code.toUpperCase();
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
  const indicatorIds = indicators.details?.map(indicator => {
      return indicator?.indicators.map(item => `${item.categoryId}-latest`);
    })
    .flat();
  const obj = {
    versionName: versionDetails.versionName,
    versionDescription: versionDetails.versionDescription,
    status: versionDetails.status,
    createdBy: versionDetails.createdBy,
  };
  indicatorIds.forEach(id => {
    obj[id] = id;
  });
  return obj;
};

const compareIds = (id1, id2) => {
  const [name1, version1] = id1.split('-');
  const [name2, version2] = id2.split('-');
  return name1 === name2 && version1 !== version2;
};
export const checkDisable = (categoryId, formikValues) => {
  const selectedCategories = Object.values(formikValues);
  const selectedCategory = selectedCategories.find(category =>
    typeof category === 'string' ? compareIds(category, categoryId) : false
  );
  return selectedCategory ? true : false;
};

export const displayDetails = surveyDetails => {
  const { questions, responses } = surveyDetails;
  const newQuestions = questions.map(question => {
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
  console.log('logged', newIndicators);
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


