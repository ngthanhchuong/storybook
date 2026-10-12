import { CatalogStory } from '../Scene';
import type { Meta,StoryObj } from '@storybook/react-vite';
const meta:Meta<Record<string,string>>={title:"Foundations/Colors",args:{},argTypes:{},parameters:{figma:{url:"https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ?node-id=14839-168043"}},render:(args)=> <CatalogStory pageId="0:1" groupId="14839:168043" properties={args}/>};
export default meta;
type Story=StoryObj<typeof meta>;
export const Playground:Story={};
export const AllVariants:Story={name:'All variants ('+1+')',render:()=> <CatalogStory pageId="0:1" groupId="14839:168043" gallery/>};
export const Variant001:Story={name:"Colors",args:{},render:(args)=><CatalogStory pageId="0:1" groupId="14839:168043" properties={args}/>};
