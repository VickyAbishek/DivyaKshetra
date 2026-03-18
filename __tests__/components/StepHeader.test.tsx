import React from 'react';
import { render } from '@testing-library/react-native';
import { StepHeader } from '../../components/add/StepHeader';

it('renders current step label', () => {
  const { getByText } = render(
    <StepHeader currentStep={2} totalSteps={5} title="Add Sacred Place" label="Basic Info" onBack={jest.fn()} onCancel={jest.fn()} />
  );
  expect(getByText(/Step 2 of 5/i)).toBeTruthy();
  expect(getByText(/Basic Info/i)).toBeTruthy();
});
