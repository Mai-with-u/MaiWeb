// 社区入口数据，与文档站“交流群”页面（docs.maibot.chat/about/community）保持一致。
// 文档站换群或新增群时，同步改这里即可，首页 QQ 群弹窗和关于页会一起更新。

export type Tone = 'primary' | 'green' | 'blue' | 'purple' | 'pink';

export interface QqGroup {
  name: string;
  description: string;
  url: string;
  // 群号：群名是玩梗、不好念的时候，给一个能直接搜的号码
  groupNumber?: string;
}

export interface QqGroupSection {
  title: string;
  tone: Tone;
  groups: QqGroup[];
}

// MaiDroid（安卓版）的用户反馈群。QQ 群弹窗之外还要用：安卓下载卡片上直接挂一条，
// 让拿到 APK 的人遇到问题时知道去哪反馈，不用自己翻群列表
export const maidroidFeedbackGroup: QqGroup = {
  name: '麦麦不吃苹果派',
  description: 'MaiDroid 用户反馈群',
  groupNumber: '750194887',
  url: 'https://qm.qq.com/q/Wf12XzKe4O',
};

export const qqGroupSections: QqGroupSection[] = [
  {
    title: '技术交流',
    tone: 'primary',
    groups: [
      {
        name: '麦麦大脑磁共振',
        description: '技术交流 / 答疑',
        url: 'https://qun.qq.com/universal-share/share?ac=1&svctype=5&tempid=h5_group_info&busi_data=eyJncm91cENvZGUiOiI3NjY3OTg1MTcifQ%3D%3D',
      },
      {
        name: '麦麦脑电图',
        description: '技术交流 / 答疑',
        url: 'https://qun.qq.com/universal-share/share?ac=1&svctype=5&tempid=h5_group_info&busi_data=eyJncm91cENvZGUiOiI1NzE3ODA3MjIifQ%3D%3D',
      },
      {
        name: '麦麦心理测验',
        description: '技术交流',
        url: 'https://qun.qq.com/universal-share/share?ac=1&svctype=5&tempid=h5_group_info&busi_data=eyJncm91cENvZGUiOiI3Mjk5NTcwMzMifQ%3D%3D',
      },
      {
        name: '麦麦7群之青春麦麦不会得玉米症',
        description: '技术交流 / 答疑',
        groupNumber: '995845542',
        url: 'https://qun.qq.com/universal-share/share?ac=1&svctype=5&tempid=h5_group_info&busi_data=eyJncm91cENvZGUiOiI5OTU4NDU1NDIifQ%3D%3D',
      },
    ],
  },
  {
    title: '闲聊吹水',
    tone: 'blue',
    groups: [
      {
        name: '闲聊群',
        description: '仅限闲聊，不答疑',
        url: 'https://qun.qq.com/universal-share/share?ac=1&svctype=5&tempid=h5_group_info&busi_data=eyJncm91cENvZGUiOiIxMDIyNDg5Nzc5In0%3D',
      },
    ],
  },
  {
    title: 'Amaidesu',
    tone: 'purple',
    groups: [{ name: 'Amaidesuwa', description: 'Amaidesu 项目交流群', url: 'https://qm.qq.com/q/Ti3RKqHvy0' }],
  },
  {
    title: '插件开发',
    tone: 'green',
    groups: [{ name: '插件开发群', description: '进阶开发与测试', url: 'https://qm.qq.com/q/t0kfHuZmSY' }],
  },
  {
    // MaiDroid（安卓版）单独一个分区：这边问的是 App 使用问题，和服务端的技术交流不是一回事
    title: 'MaiDroid',
    tone: 'pink',
    groups: [maidroidFeedbackGroup],
  },
];

export interface SocialLink {
  name: string;
  description: string;
  url: string;
}

// QQ 以外的官方平台
export const socialLinks: SocialLink[] = [
  { name: 'GitHub', description: '看代码、提 Issue、交 PR', url: 'https://github.com/Mai-with-u/MaiBot' },
  { name: 'X', description: '官方账号', url: 'https://x.com/MaiWithYou' },
  { name: 'Discord', description: 'Discord 群', url: 'https://discord.gg/UvgPVSVX' },
  { name: 'Telegram', description: '官方频道', url: 'https://t.me/MaiWithYou' },
];
