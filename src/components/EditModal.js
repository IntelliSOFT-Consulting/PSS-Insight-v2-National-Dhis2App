import React from 'react';
import { TextArea } from '@dhis2/ui';
import Modal from './Modal';

export default function EditModal({ children, ...props }) {
  return (
    <Modal {...props}>
      <TextArea
        value={props.value}
        name={props.open?.categoryId || props.open?.id}
        onChange={props.onChange}
        rows={props.rows || 5}
      />
    </Modal>
  );
}
