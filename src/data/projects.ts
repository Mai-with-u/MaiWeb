import type { ImageMetadata } from 'astro';
import amaidesuBg from '../assets/amaidesu.png';
import maicraftBg from '../assets/maicraft.png';
import mofoxBg from '../assets/mofox.jpg';
// 图片来自各项目 README，分别为 AstrBot 界面截图与 Pallas-Bot 项目头像。
// https://github.com/user-attachments/assets/f17cdb90-52d7-4773-be2e-ff64b566af6b
// https://github.com/PallasBot/Pallas-Bot/blob/main/docs/plugins/assets/brand-avatar.png
import astrbotBg from '../assets/astrbot.webp';
import pallasBg from '../assets/pallas-bot.png';
import { links } from './links';

// 麦麦项目属于 Mai-with-u 官方组织；麦麦朋友项目由社区伙伴独立维护。
// 官方精选项目的第一项是左侧大卡，其余项目依次排在右侧。
export interface FeaturedProject {
  name: string;
  description: string;
  href: string;
  image: ImageMetadata;
  // 卡片底色，配合背景图压暗，保证白字可读
  tone: 'forest' | 'earth' | 'navy';
}

export const officialFeaturedProjects: FeaturedProject[] = [
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
];

export const friendProjects: FeaturedProject[] = [
  {
    name: 'Neo-MoFox',
    description: 'MoFox 团队重写的聊天机器人框架，前身是从 MaiBot 分出去的增强版 MoFox_Bot。',
    href: 'https://github.com/MoFox-Studio/Neo-MoFox',
    image: mofoxBg,
    tone: 'navy',
  },
  {
    name: 'AstrBot',
    description: '把 AI 助手接入 QQ、Telegram 等聊天平台，支持多种大模型，也能用插件扩展更多玩法。',
    href: 'https://github.com/AstrBotDevs/AstrBot',
    image: astrbotBg,
    tone: 'navy',
  },
  {
    name: 'Pallas-Bot',
    description: '会从群聊中学习的帕拉斯，大家也叫她“牛牛”。自动接话、复读和贴表情，和群友一起玩。',
    href: 'https://github.com/PallasBot/Pallas-Bot',
    image: pallasBg,
    tone: 'earth',
  },
];

export interface CompactProject {
  name: string;
  description: string;
  href: string;
  color: string;
}

export const officialCompactProjects: CompactProject[] = [
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
