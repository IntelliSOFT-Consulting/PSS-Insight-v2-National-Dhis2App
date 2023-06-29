
import axios from 'axios';
import authHeader from './config/auth';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/29',
  headers: {
    Authorization: authHeader,
    'Content-Type': 'application/json',
  },
});

class Indicator {
  constructor(properties) {
    this.questions = properties.questions;
  }

  createOptionSet() {
    const questionsWithOptionSet = this.questions.filter(
      question => question.options
    );
    const optionSet = questionsWithOptionSet.map(async question => {
      const { name, options } = question;
      const { data } = await api.post('/optionSets', {
        name,
        valueType: 'TEXT',
      });
      const optionSetId = data.response.uid;
      await Promise.all(
        options.map(async (option, i) => {
          const { name, code } = option;
          const { data } = await api.post(`/options`, {
            name,
            code,
            optionSet: {
              id: optionSetId,
            },
            sortOrder: i + 1,
          });
          return data.response.uid;
        })
      );
      return {
        ...question,
        optionSetId,
      };
    });
    return Promise.all(optionSet);
  }
}

const indicator = new Indicator({
  questions: [
    {
      name: 'question1',
      options: [
        {
          name: 'option1',
          code: 'option1',
        },
        {
          name: 'option2',
          code: 'option2',
        },
      ],
    },
    {
      name: 'question2',
      options: [
        {
          name: 'option1',
          code: 'option1',
        },
        {
          name: 'option2',
          code: 'option2',
        },
      ],
    },
  ],
});

indicator.createOptionSet().then(console.log);
