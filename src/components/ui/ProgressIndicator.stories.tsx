import { ProgressIndicator } from './ProgressIndicator';

export default {
  title: 'UI/ProgressIndicator',
  component: ProgressIndicator,
  args: {
    totalSteps: 10,
    currentStep: 3,
  },
};

export const Default = {};

export const LaterStep = {
  args: {
    currentStep: 7,
  },
};
