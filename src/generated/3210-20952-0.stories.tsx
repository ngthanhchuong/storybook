import { CatalogStory } from '../Scene';
import type { Meta,StoryObj } from '@storybook/react-vite';
const meta:Meta<Record<string,string>>={title:"Foundations/Layout Grid/Pages Container",args:{},argTypes:{},parameters:{figma:{url:"https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=14841-10816"}},render:(args)=> <CatalogStory pageId="3210:20952" groupId="14841:10816" properties={args}/>};
export default meta;
type Story=StoryObj<typeof meta>;
export const Playground:Story={};
export const AllVariants:Story={name:'All variants ('+1+')',render:()=> <CatalogStory pageId="3210:20952" groupId="14841:10816" gallery/>};
export const Variant001:Story={name:"Pages Container",args:{},render:(args)=><CatalogStory pageId="3210:20952" groupId="14841:10816" properties={args}/>};
