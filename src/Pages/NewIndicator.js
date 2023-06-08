import React, { useState, useEffect } from 'react';
import CardItem from '../components/Card';
import { createUseStyles } from 'react-jss';
import { Form, Input, Select, Button, Table, Card } from 'antd';
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
import { formatFormulaByIndex } from '../utils/helpers';

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
  const [currentQuestion, setCurrentQuestion] = useState({
    name: '',
    valueType: null,
  });
  const [isQuantitative, setIsQuantitative] = useState(false);

  const classes = useStyles();

  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

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

  const footer = (
    <div className={classes.footer}>
      <Button
        onClick={() => {
          setQuestions([]);
          form.resetFields();
          setCurrentQuestion({ name: '', valueType: '' });
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
      >
        Save
      </Button>
    </div>
  );

  const handleKeyPress = () => {
    if (currentQuestion.name && currentQuestion.valueType) {
      setQuestions([...questions, currentQuestion]);
      setCurrentQuestion({ name: null, valueType: null });
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
          onClick={() => {
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
          }}
        >
          Remove
        </Button>
      ),
      width: '20%',
    },
  ];

  const handleSubmit = async values => {
    try {
      const numerator = values.numerator || '';
      const denominator = values.denominator || '';

      let payload = {
        ...values,
        assessmentQuestions: questions,
        createdBy: {
          id: user?.me?.id,
          code: '',
          name: user?.me?.name,
          username: user?.me?.username,
          displayName: user?.me?.name,
        },
        formula: {
          format: values.format,
        },
      };

      [numerator, denominator].forEach((formula, index) => {
        if (formula) {
          const formattedFormula = formatFormulaByIndex(formula, questions);
          if (index === 0) {
            payload.formula = {
              ...payload.formula,
              numerator: formattedFormula,
            };
          } else {
            payload.formula = {
              ...payload.formula,
              denominator: formattedFormula,
            };
          }
        }
      });
      delete payload.numerator;
      delete payload.denominator;
      delete payload.format;

      const saveReference = id
        ? updateReference(id, payload)
        : createReference(payload);
      if (saveReference) {
        setSuccess(() =>
          id
            ? 'Indicator updated successfully!'
            : 'Indicator created successfully!'
        );
        setTimeout(() => {
          setSuccess(false);
          navigate('/indicators/dictionary');
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      setError('Something went wrong!');
    }
  };

  const methodsOfEstimationOptions = [
    { label: 'Qualitative', value: 'Qualitative' },
    { label: 'Quantitative', value: 'Quantitative' },
  ];

  const typeOfFormulaOptions = [
    { label: 'Percentage', value: 'Percentage' },
    { label: 'Number', value: 'Number' },
  ];

  const components = {
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
            <Input placeholder='Name' size='large' />
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
              options={valueTypes?.map(dataType => {
                return {
                  value: dataType,
                  label: dataType,
                };
              })}
            />
          </Form.Item>
        </div>
        <Title text='ASSESSMENT QUESTIONS:' type='primary' />
        <div className={classes.questions}>
          <div className={classes.question}>
            <Input
              placeholder='Add Question'
              size='large'
              value={currentQuestion.name}
              onChange={e =>
                setCurrentQuestion({
                  ...currentQuestion,
                  name: e.target.value,
                })
              }
            />
            <Select
              className={classes.select}
              placeholder={'Select a type'}
              size='large'
              value={currentQuestion.valueType}
              onChange={value =>
                setCurrentQuestion({ ...currentQuestion, valueType: value })
              }
              options={valueTypes?.map(valueType => {
                return {
                  value: valueType,
                  label: valueType,
                };
              })}
            />

            <Button size='large' type='primary' onClick={handleKeyPress}>
              Add
            </Button>
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
            name='proposedScoring'
            label='Targets'
            className={classes.definition}
          >
            <Input.TextArea placeholder='Targets' size='large' rows={5} />
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
                options={methodsOfEstimationOptions}
                onChange={value => {
                  if (value === 'Quantitative') {
                    setIsQuantitative(true);
                  } else {
                    setIsQuantitative(false);
                  }
                }}
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
                options={typeOfFormulaOptions}
              />
            </Form.Item>
            {isQuantitative && (
              <>
                <FormulaInput
                  questions={questions.map((question, i) => question.name)}
                  Form={Form}
                  form={form}
                  Input={Input}
                  name='numerator'
                  label='Numerator'
                  placeholder={'Numerator'}
                  required={true}
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
                />
              </>
            )}
          </div>
        </Card>
      </Form>
    </CardItem>
  );
}
