import type { Preview } from '@storybook/react-vite';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter-tight';
import '../src/styles.css';
import '../src/tokens.css';
const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: { options: { light: { name: 'Light', value: '#ffffff' }, dark: { name: 'Dark', value: '#171717' } } },
    options: { storySort: { order: ['Welcome', 'Foundations', 'Components'] } },
  },
};
export default preview;
