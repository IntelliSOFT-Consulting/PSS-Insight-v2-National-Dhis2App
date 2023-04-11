import React from 'react';
import {
  Field,
  Radio,
  Input,
  SingleSelect,
  SingleSelectField,
  SingleSelectOption,
  TextArea,
} from '@dhis2/ui';
import classes from '../App.module.css';

export default function FormDef({
  type,
  onChange,
  value,
  options = [],
  ...rest
}) {
  const fieldProps = {
    error: rest.error,
    validationText: rest.validationText,
    label: rest.label,
    required: rest.required,
    name: rest.name,
  };

  const booleanOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  return (
    <>
      {type === 'NUMBER' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <Input
            type='number'
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
          />
        </Field>
      )}
      {type === 'TEXT' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <Input
            type='text'
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
          />
        </Field>
      )}
      {type === 'TEXTAREA' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <TextArea
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
          />
        </Field>
      )}
      {type === 'BOOLEAN' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          {booleanOptions.map(option => (
            <Radio
              key={option.label}
              label={option.label}
              name={rest.name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
            />
          ))}
        </Field>
      )}
      {type === 'SELECT' && (
        <SingleSelectField {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <SingleSelect
            name={rest.name}
            selected={value}
            onChange={onChange}
            error={rest.error}
          >
            {options.map(option => (
              <SingleSelectOption
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </SingleSelect>
        </SingleSelectField>
      )}
    </>
  );
}
