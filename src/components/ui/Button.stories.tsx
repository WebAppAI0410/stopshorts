import { Button } from './Button';

export default {
  title: 'UI/Button',
  component: Button,
  args: {
    title: 'Primary',
    onPress: () => {},
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export const Primary = {};

export const Loading = {
  args: {
    title: 'Loading',
    loading: true,
  },
};

export const Disabled = {
  args: {
    title: 'Disabled',
    disabled: true,
  },
};
