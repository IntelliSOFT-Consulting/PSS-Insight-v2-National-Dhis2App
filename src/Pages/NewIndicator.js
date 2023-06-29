import React, { useState, useEffect } from 'react';
import CardItem from '../components/Card';
import { createUseStyles } from 'react-jss';
import { Form, Input, Select, Button, Table, Card, Alert } from 'antd';
import Title from '../components/Title';
import {
  createReference,
  getReferenceDetails,
  updateReference,
  getDropdowns,
} from '../api/indicators';
import Notification from '../components/Notification';
import { useNavigate, useParams } from 'react-router-dom';
import FormulaInput from '../components/FormulaInput';
import { formatFormulaByIndex, sentenceCase } from '../utils/helpers';
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime';
import useAddDictionary from '../hooks/useAddDictionary';
import ExpressionInput from '../components/ExpressionInput';
import { aggregationTypes, components, dataTypeOptions } from '../Data/options';
import delay from '../utils/delay';

const useStyles = createUseStyles({
  basicDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    position: 'relative',

    columnGap: '2rem',
    '& @media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  definition: {
    gridColumn: '2 / 3',
    gridRow: '3 / 5',
  },
  question: {
    display: 'flex',
    alignItems: 'center',
    '& input': {
      width: '100%',
    },
    '& button': {
      marginLeft: '1rem',
      backgroundColor: '#002656',
      padding: '0 2rem !important',
      '&:hover': {
        backgroundColor: '#002F6C !important',
      },
    },
  },
  select: {
    width: '20% !important',
    marginLeft: '1rem',
  },
  table: {
    margin: '1rem 0px',
  },
  danger: {
    color: '#F20F0F !important',
  },
  btnSuccess: {
    backgroundColor: '#218838 !important',
    color: 'white',
    border: 'none',
    '&:hover': {
      backgroundColor: '#218838 !important',
      color: 'white !important',
    },
  },
  btnCancel: {
    backgroundColor: '#F2F2F2 !important',
    marginRight: '1rem',
    border: 'none !important',
    '&:hover': {
      backgroundColor: '#F2F2F2 !important',
      outline: 'none !important',
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  formula: {
    backgroundColor: '#F5F9FC',
  },
});
export default function NewIndicator({ user }) {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState('');
  const [valueTypes, setValueTypes] = useState([]);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState();
  const [indicatorName, setIndicatorName] = useState('');
  const [validations, setValidations] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    loading: indicatorTypeLoading,
    error: indicatorTypeError,
    // destructure indicatorTypes
    data: { indicatorTypes: { indicatorTypes } = {} } = {},
  } = useDataQuery({
    indicatorTypes: {
      resource: 'indicatorTypes',
      params: {
        fields: 'id,displayName',
      },
    },
  });

  const { createDataElements, success: indicatorSuccess } = useAddDictionary();

  const classes = useStyles();

  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

  const optionsMutation = {
    resource: 'options',
    type: 'create',
    data: ({ name, code, sortOrder, optionSet }) => ({
      name,
      code,
      sortOrder,
      optionSet,
    }),
  };
  const mutation = {
    resource: 'optionSets',
    type: 'create',
    data: ({ name }) => ({
      name,
      valueType: 'TEXT',
    }),
  };

  const [mutate] = useDataMutation(mutation);
  const [mutateOptions] = useDataMutation(optionsMutation);

  const createOptionSet = async () => {
    const questionsWithOptionSet = questions.filter(
      question => question.options
    );
    const optionSetPromises = questionsWithOptionSet.map(async question => {
      const { name, options } = question;
      const { response } = await mutate({ name, options });
      const optionSetId = response.uid;
      const optionPromises = options.map(async (option, i) => {
        await delay(i, 700);
        await mutateOptions({
          name: option,
          code: option,
          sortOrder: i + 1,
          optionSet: { id: optionSetId },
        });
        return { optionSetId };
      });
      await Promise.all(optionPromises);
      return { ...question, optionSetId };
    });
    const optionSetResults = await Promise.all(optionSetPromises);
    return { optionSetId: optionSetResults[0]?.optionSetId };
  };

  const fetchDetails = async () => {
    try {
      const data = await getReferenceDetails(id);
      if (data) {
        form.setFieldsValue({
          ...data,
        });
        if (data?.systemComponent) {
          setTopics(data.systemComponent);
        }
        setQuestions(data.assessmentQuestions);
      }
    } catch (error) {
      setError('Something went wrong!');
    }
  };

  const fetchDropdowns = async () => {
    try {
      const data = await getDropdowns();
      if (data) {
        setValueTypes(data.valueType?.details);
      }
    } catch (error) {
      setError('Something went wrong!');
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
    fetchDropdowns();
  }, [id]);

  useEffect(() => {
    if (indicatorSuccess) {
      setSuccess('Indicator added successfully!');
      setTimeout(() => {
        setSuccess(false);
        navigate('/indicators/dictionary');
      }, 2000);
    }
  }, [indicatorSuccess]);

  const handleAddQuestion = () => {
    if (currentQuestion?.name && currentQuestion?.valueType) {
      if (currentQuestion?.valueType === 'CODED') {
        if (
          !currentQuestion?.options ||
          currentQuestion?.options?.length === 0
        ) {
          setValidations('Please add options for this question');
          return;
        }
      }
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({ name: null, valueType: null });
      setValidations(null);
    } else {
      setValidations('Please add a question and select a type');
    }
  };

  const handleRemoveClick = (record, index) => {
    const denominator = form.getFieldValue('denominator');
    const numerator = form.getFieldValue('numerator');
    const denominatorHasQuestion = denominator?.includes(record.name);
    const numeratorHasQuestion = numerator?.includes(record.name);
    if (denominatorHasQuestion || numeratorHasQuestion) {
      setError(
        'This question is used in a formula. Please remove it from the formula to delete it.'
      );
      setTimeout(() => {
        setError(false);
      }, 6000);
    } else {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const columns = [
    {
      title: 'QUESTIONS',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'TYPE',
      dataIndex: 'valueType',
      key: 'valueType',
      render: text =>
        text === 'SELECTION' ? 'Yes/No' : text === 'NUMBER' ? 'Number' : 'Text',
      width: '30%',
    },
    {
      title: 'ACTIONS',
      dataIndex: 'action',
      key: 'action',
      render: (_, record, index) => (
        <Button
          type='danger'
          kind='link'
          className={classes.danger}
          onClick={() => handleRemoveClick(record, index)}
        >
          Remove
        </Button>
      ),
      width: '20%',
    },
  ];

  const handleSubmit = async values => {
    try {
      const { numerator = '', denominator = '' } = values;

      const finalQuestions = await Promise.all(
        questions.map(async question => {
          if (question.options) {
            const { optionSetId } = await createOptionSet();
            const options = question.options?.map(option => ({
              name: option,
              code: option,
            }));

            return {
              ...question,
              options: undefined,
              valueType: question.valueType?.replace('CODED', 'TEXT'),
              aggregationType:
                question.valueType === 'NUMBER' ? 'SUM' : 'COUNT',
              optionSet: {
                id: optionSetId,
                options,
              },
            };
          }
          return question;
        })
      );

      const payload = {
        ...values,
        assessmentQuestions: finalQuestions,
        createdBy: {
          id: user?.me?.id,
          code: '',
          name: user?.me?.name,
          username: user?.me?.username,
          displayName: user?.me?.name,
        },
        formula: {
          format: values.format,
          numerator,
          denominator,
        },
      };

      delete payload.numerator;
      delete payload.denominator;
      delete payload.format;

      await createDataElements(payload);
    } catch (error) {
      console.log(error);
      setError('Something went wrong!');
    }
  };

  const addQuestionOptions = values => {
    const { options } = values;
    const textOptions = options?.map(option => option?.key);
    setCurrentQuestion({ ...currentQuestion, options: textOptions });
  };

  const footer = (
    <div className={classes.footer}>
      <Button
        onClick={() => {
          setQuestions([]);
          form.resetFields();
          setCurrentQuestion({ name: null, valueType: null });
          navigate('/indicators/dictionary');
        }}
        className={classes.btnCancel}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          form.submit();
        }}
        className={classes.btnSuccess}
        loading={loading}
      >
        Save
      </Button>
    </div>
  );

  const methods = [
    'if()',
    'isNull()',
    'isNotNull()',
    'AND',
    'NOT',
    'OR',
    '==',
    '<',
    '>',
    '>=',
    '<=',
    '!=',
  ];

  return (
    <CardItem title='ADD INDICATOR' footer={footer}>
      {success && (
        <Notification
          status='success'
          message={success}
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <Notification
          status='error'
          message={error}
          onClose={() => setError(false)}
        />
      )}
      <Form layout='vertical' form={form} onFinish={handleSubmit}>
        <div className={classes.basicDetails}>
          <Form.Item
            label='Indicator Name'
            name='indicatorName'
            rules={[
              {
                required: true,
                message: 'Please input the indicator name!',
              },
            ]}
          >
            <Input
              onChange={e => setIndicatorName(e.target.value)}
              placeholder='Name'
              size='large'
            />
          </Form.Item>
          <Form.Item
            name='systemComponent'
            label='System Component/Outcome/Attribute'
            rules={[
              {
                required: true,
                message: 'Please select an option!',
              },
            ]}
          >
            <Select
              removeIcon
              placeholder='System Component/Outcome/Attribute'
              size='large'
              onChange={value => setTopics(value)}
              options={Object.keys(components).map(component => {
                return {
                  value: component,
                  label: component,
                };
              })}
            ></Select>
          </Form.Item>

          <Form.Item
            name='indicatorCode'
            label='PSS Insight Indicator #'
            rules={[
              {
                required: true,
                message: 'Please input the indicator code!',
              },
            ]}
          >
            <Input placeholder='PSS Insight Indicator #' size='large' />
          </Form.Item>

          <Form.Item
            name='dimension'
            label='System Element/Dimension'
            rules={[
              {
                required: true,
                message: 'Please select a dimension!',
              },
            ]}
          >
            <Select
              removeIcon
              placeholder='System Element/Dimension'
              size='large'
              options={components[topics]?.map(element => {
                return {
                  value: element,
                  label: element,
                };
              })}
            ></Select>
          </Form.Item>
          <Form.Item
            name='definition'
            label='Definition'
            className={classes.definition}
            rules={[
              {
                required: true,
                message: 'Please input the definition!',
              },
            ]}
          >
            <Input.TextArea placeholder='Definition' size='large' rows={5} />
          </Form.Item>
          <Form.Item
            name='dataType'
            label='Data Type'
            rules={[
              {
                required: true,
                message: 'Please input type!',
              },
            ]}
          >
            <Select
              placeholder='Select a data type'
              size='large'
              options={dataTypeOptions}
            />
          </Form.Item>
        </div>
        <Title text='ASSESSMENT QUESTIONS:' type='primary' />
        <div className={classes.questions}>
          <div className={classes.question}>
            <div className={classes.questionInputs}>
              <Input
                placeholder='Add Question'
                size='large'
                value={currentQuestion?.name}
                onChange={e => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    name: e.target.value,
                  });
                  setValidations(null);
                }}
              />
              <Select
                className={classes.select}
                placeholder={'Select a type'}
                size='large'
                value={currentQuestion?.valueType}
                onChange={value => {
                  setValidations(null);
                  setCurrentQuestion({ ...currentQuestion, valueType: value });
                }}
                options={[
                  ...(valueTypes?.map(valueType => {
                    return {
                      value: valueType,
                      label: sentenceCase(
                        valueType?.replace(/SELECTION/g, 'Yes/No')
                      ),
                    };
                  }) || []),
                  {
                    label: 'Multiple Choice',
                    value: 'CODED',
                  },
                ]}
              />
            </div>
            {currentQuestion?.valueType === 'CODED' && (
              <div className={classes.questionsContainer}>
                <h1>Add Selection Options</h1>
                <div className={classes.selections}>
                  <OptionsForm onFinish={addQuestionOptions} />
                </div>
              </div>
            )}
            {validations && (
              <Alert
                showIcon
                message={validations}
                type='error'
                size='small'
                style={{ marginBottom: '10px' }}
              />
            )}
            <div className={`${classes.footer} ${classes.borderTop}`}>
              <Button size='large' type='primary' onClick={handleAddQuestion}>
                Add
              </Button>
            </div>
          </div>

          <Table
            className={classes.table}
            dataSource={questions}
            columns={columns}
            pagination={false}
            bordered
            size='small'
            locale={{
              emptyText: 'No questions added yet',
            }}
          />
        </div>
        <div className={classes.basicDetails}>
          <Form.Item name='purposeAndIssues' label='Purpose and Issues'>
            <Input.TextArea
              placeholder='Purpose and Issues'
              size='large'
              rows={4}
            />
          </Form.Item>

          <Form.Item name='preferredDataSources' label='Preferred Data Sources'>
            <Input.TextArea
              placeholder='Preferred Data Sources'
              size='large'
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name='benchmark'
            label='National Target'
            className={classes.definition}
          >
            <Input.TextArea
              placeholder='National Target'
              size='large'
              rows={5}
            />
          </Form.Item>
          <Form.Item
            name='expectedFrequencyDataDissemination'
            label='Expected Frequency of Data Dissemination'
            rules={[
              {
                required: true,
                message:
                  'Please input the expected frequency of data dissemination!',
              },
            ]}
          >
            <Input
              placeholder='Expected Frequency of Data Dissemination'
              size='large'
            />
          </Form.Item>
          <Form.Item
            name='indicatorReference'
            label='Indicator Reference Number(s)'
            rules={[
              {
                required: true,
                message: 'Please input the indicator reference number(s)!',
              },
            ]}
          >
            <Input placeholder='Indicator Reference Number(s)' size='large' />
          </Form.Item>
          <Form.Item name='indicatorSource' label='Indicator Source(s)'>
            <Input.TextArea
              placeholder='Indicator Source(s)'
              size='large'
              rows={4}
            />
          </Form.Item>
        </div>

        <Card title='FORMULA' className={classes.formula} size='small'>
          <div className={classes.basicDetails}>
            <Form.Item
              name='methodOfEstimation'
              label='Method of Estimation'
              rules={[
                {
                  required: true,
                  message: 'Please select a method of estimation!',
                },
              ]}
            >
              <Select
                placeholder='Select a method of estimation'
                notFoundContent='No methods of estimation found'
                size='large'
                options={aggregationTypes}
              />
            </Form.Item>
            <Form.Item
              name='format'
              label='Type of Formula'
              rules={[
                {
                  required: true,
                  message: 'Please select a type of formula!',
                },
              ]}
            >
              <Select
                placeholder='Select a type of formula'
                notFoundContent='No types of formula found'
                size='large'
                options={indicatorTypes?.map(item => ({
                  label: item?.displayName,
                  value: item?.id,
                }))}
              />
            </Form.Item>
            <div className={classes.expression}>
              <Alert
                showIcon
                message={`Allowed methods are:\n ${
                  methods?.join(', ') || ''
                } (case insensitive)`}
                type='info'
                size='small'
                style={{ marginBottom: '10px' }}
              />

              <ExpressionInput
                questions={questions.map((question, i) => question.name)}
                Form={Form}
                form={form}
                Input={Input}
                name='expression'
                placeholder='Expression'
                label='Expression'
                indicatorName={indicatorName}
              />
            </div>

            <FormulaInput
              questions={questions.map((question, i) => question.name)}
              Form={Form}
              form={form}
              Input={Input}
              name='numerator'
              label='Numerator'
              placeholder={'Numerator'}
              required={true}
              indicatorName={indicatorName}
            />
            <FormulaInput
              questions={questions.map((question, i) => question.name)}
              Form={Form}
              form={form}
              Input={Input}
              name='denominator'
              label='Denominator'
              placeholder={'Denominator'}
              required={true}
              indicatorName={indicatorName}
            />
          </div>
        </Card>
      </Form>
    </CardItem>
  );
}
