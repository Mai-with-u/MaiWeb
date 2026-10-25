import type { ImageMetadata } from 'astro';
import amaidesuBg from '../assets/amaidesu.png';
import maicraftBg from '../assets/maicraft.png';
import mofoxBg from '../assets/mofox.jpg';
import { links } from './links';

// 衍生项目页的卡片数据。排列顺序就是页面顺序：
// 第一项是左侧大卡，后两项依次排在右侧。
export interface FeaturedProject {
  name: string;
  description: string;
  href: string;
  image: ImageMetadata;
  // 卡片底色，配合背景图压暗，保证白字可读
  tone: 'forest' | 'earth' | 'navy';
}

export const featuredProjects: FeaturedProject[] = [
  {
    name: 'Amaidesu',
    description: '麦麦去当虚拟主播了。她会自己看弹幕、挑时机接话，用虚拟形象和声音开播。',
    href: 'https://github.com/Mai-with-u/Amaidesu',
    image: amaidesuBg,
    tone: 'forest',
  },
  {
    name: 'MaiCraft',
    description: '让麦麦进 Minecraft 自己玩。跟她说“去砍树”“做几支火把”，她会像玩家一样一步步做完。',
    href: 'https://github.com/Mai-with-u/MaiCraftMod',
    image: maicraftBg,
    tone: 'earth',
  },
  {
    name: 'Neo-MoFox',
    description: 'MoFox 团队重写的聊天机器人框架，前身是从 MaiBot 分出去的增强版 MoFox_Bot。',
    href: 'https://github.com/MoFox-Studio/Neo-MoFox',
    image: mofoxBg,
    tone: 'navy',
  },
];

export interface CompactProject {
  name: string;
  description: string;
  href: string;
  color: string;
}

export const compactProjects: CompactProject[] = [
  {
    name: 'MaiBot 文档站',
    description: '怎么装、怎么配、怎么写插件，都在这。',
    href: links.docs,
    color: 'var(--c-primary)',
  },
  {
    name: 'MaiDroid',
    description: '在安卓手机上直接跑麦麦，不用服务器（还在测试）。',
    href: links.droidRepo,
    color: 'var(--c-green-strong)',
  },
  {
    name: 'MaiWeb',
    description: '麦麦官网（？',
    href: links.siteRepo,
    color: '#007aff',
  },
];
