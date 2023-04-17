import React from 'react';
import { TextArea } from '@dhis2/ui';
import Modal from './Modal';

export default function EditModal({ children, ...props }) {
  return <Modal {...props}>{children}</Modal>;
}
