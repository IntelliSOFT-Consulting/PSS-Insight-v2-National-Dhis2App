export const methodsOfEstimationOptions = [
  { label: 'Qualitative', value: 'Qualitative' },
  { label: 'Quantitative', value: 'Quantitative' },
];

export const aggregationTypes = [
  { label: 'None', value: 'NONE' },
  { label: 'Average', value: 'AVERAGE' },
  { label: 'Average Sum', value: 'AVERAGE_SUM_ORG_UNIT' },
  { label: 'Count', value: 'COUNT' },
  {
    label: 'Last value (average in org unit hierarchy)',
    value: 'LAST_VALUE_AVERAGE_ORG_UNIT',
  },
  {
    label: 'Last value (sum in org unit hierarchy)',
    value: 'LAST_VALUE_SUM_ORG_UNIT',
  },
  {
    label: 'Last value in period (average in org unit hierarchy)',
    value: 'LAST_VALUE_IN_PERIOD_AVERAGE_ORG_UNIT',
  },
  {
    label: 'Last value in period (sum in org unit hierarchy)',
    value: 'LAST_VALUE_IN_PERIOD_SUM_ORG_UNIT',
  },
  {
    label: 'First value (sum in org unit hierarchy)',
    value: 'FIRST_VALUE_SUM_ORG_UNIT',
  },
  {
    label: 'First value (average in org unit hierarchy)',
    value: 'FIRST_VALUE_AVERAGE_ORG_UNIT',
  },
  { label: 'Standard deviation', value: 'STDDEV' },
  { label: 'Sum', value: 'SUM' },
  { label: 'Variance', value: 'VARIANCE' },
  { label: 'Min', value: 'MIN' },
  { label: 'Max', value: 'MAX' },
  { label: 'Default', value: 'DEFAULT' },
];

export const components = {
  'Pharmaceutical Products and Services': [
    'Procurement',
    'Distribution',
    'Use',
  ],
  'Policy, Laws, and Governance': [
    'Pharmaceutical policies',
    'Pharmaceutical laws and regulations',
    'Coordination and leadership',
    'Ethics, transparency and accountability',
  ],
  'Regulatory Systems': [
    'Product assessment and registration',
    'Licensing of establishments and personnel',
    'Inspection and enforcement',
    'Quality and safety surveillance',
    'Regulation and oversight of clinical trials',
    'Control of pharmaceutical marketing practices',
  ],
  'Innovation, Research and Development, Manufacturing, and Trade': [
    'Innovation, research and development',
    'Manufacturing capacity',
    'Intellectual property and trade',
  ],
  Financing: [
    'Resource coordination, allocation, distribution and payment',
    'Financial risk protection strategies',
    'Revenue and expenditure tracking and management',
    'Costing and pricing',
  ],
  'Human Resources': [
    'Human resources policy and strategy',
    'Human resources management',
    'Human resources development',
  ],
};

export const dataTypeOptions = [
  {
    label: 'Number',
    value: 'NUMBER',
  },
  {
    label: 'Text',
    value: 'TEXT',
  },
  {
    label: 'Yes/No',
    value: 'BOOLEAN',
  },
];
