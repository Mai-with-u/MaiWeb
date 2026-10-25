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
    description: '让麦麦当虚拟主播：读弹幕、听语音，自己决定什么时候开口，再驱动语音合成与虚拟形象完成直播。',
    href: 'https://github.com/Mai-with-u/Amaidesu',
    image: amaidesuBg,
    tone: 'forest',
  },
  {
    name: 'MaiCraft',
    description: '让麦麦以第一人称玩 Minecraft 的模组：大模型通过内嵌的 MCP 服务下达目标，由模组像真人玩家一样去完成。',
    href: 'https://github.com/Mai-with-u/MaiCraftMod',
    image: maicraftBg,
    tone: 'earth',
  },
  {
    name: 'Neo-MoFox',
    description: 'MoFox 团队全新重构的 AI 聊天机器人框架，前身是基于 MaiBot 的增强分支，同样以创造数字生命为目标。',
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
    description: '部署教程、配置说明与插件开发指南。',
    href: links.docs,
    color: 'var(--c-primary)',
  },
  {
    name: 'MaiDroid',
    description: '让麦麦直接运行在 Android 设备上，无需服务器（测试版）。',
    href: links.droidRepo,
    color: 'var(--c-green-strong)',
  },
  {
    name: 'MaiWeb',
    description: '麦麦官网，也就是你正在看的这个网站。',
    href: links.siteRepo,
    color: '#007aff',
  },
];
