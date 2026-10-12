import { CatalogStory } from '../Scene';
import type { Meta,StoryObj } from '@storybook/react-vite';
const meta:Meta<Record<string,string>>={title:"Foundations/Typography/Font Size",args:{},argTypes:{},parameters:{figma:{url:"https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=14841-18917"}},render:(args)=> <CatalogStory pageId="2701:21012" groupId="14841:18917" properties={args}/>};
export default meta;
type Story=StoryObj<typeof meta>;
export const Playground:Story={};
export const AllVariants:Story={name:'All variants ('+1+')',render:()=> <CatalogStory pageId="2701:21012" groupId="14841:18917" gallery/>};
export const Variant001:Story={name:"Font Size",args:{},render:(args)=><CatalogStory pageId="2701:21012" groupId="14841:18917" properties={args}/>};
