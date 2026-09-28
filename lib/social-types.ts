export const avatarOptions = [
  { id: "moon", symbol: "☽", label: "Nguyệt ảnh" },
  { id: "dragon", symbol: "龍", label: "Thanh long" },
  { id: "fox", symbol: "✦", label: "Hồ tiên" },
  { id: "sword", symbol: "⚔", label: "Kiếm tu" },
  { id: "flame", symbol: "火", label: "Hỏa linh" },
  { id: "lotus", symbol: "❀", label: "Liên hoa" },
] as const;

export const validAvatarIds: string[] = [
  ...avatarOptions.map((option) => option.id),
  "upload",
];

export type PublicProfile = {
  id: number;
  publicId: string;
  cultivationXp: number;
  avatarFrameId: string;
  name: string;
  avatarId: string;
  avatarVersion?: string | null;
  bio: string;
  joinedAt: string;
  role: "admin" | "user";
  commentCount: number;
  followersCount: number;
  followingCount: number;
  following: boolean;
  relation: "self" | "none" | "sent" | "received" | "friends";
  relationLinkId: number | null;
  comments: {
    id: number;
    movieId: number;
    movieSlug: string;
    movieTitle: string;
    body: string;
    createdAt: string;
  }[];
};

export type SocialUser = {
  id: number;
  publicId: string;
  avatarFrameId?: string;
  cultivationXp?: number;
  name: string;
  avatarId: string;
  avatarVersion?: string | null;
  bio: string;
};

export type FriendLink = {
  id: number;
  requesterId: number;
  recipientId: number;
  status: "pending" | "accepted";
  user: SocialUser;
};

export type SocialInbox = {
  realtimeTopic: string;
  friends: FriendLink[];
  incoming: FriendLink[];
  outgoing: FriendLink[];
  unreadCount: number;
};

export type DirectMessage = {
  id: number;
  senderId: number;
  recipientId: number;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type WorldMessage = {
  id: number;
  senderId: number;
  body: string;
  createdAt: string;
  author: SocialUser;
};
