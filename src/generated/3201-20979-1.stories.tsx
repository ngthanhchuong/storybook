import { CatalogStory } from '../Scene';
import type { Meta,StoryObj } from '@storybook/react-vite';
const meta:Meta<Record<string,string>>={title:"Foundations/Shadows & Borders/Shadows",args:{},argTypes:{},parameters:{figma:{url:"https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=15119-65654"}},render:(args)=> <CatalogStory pageId="3201:20979" groupId="15119:65654" properties={args}/>};
export default meta;
type Story=StoryObj<typeof meta>;
export const Playground:Story={};
export const AllVariants:Story={name:'All variants ('+1+')',render:()=> <CatalogStory pageId="3201:20979" groupId="15119:65654" gallery/>};
export const Variant001:Story={name:"Shadows",args:{},render:(args)=><CatalogStory pageId="3201:20979" groupId="15119:65654" properties={args}/>};
