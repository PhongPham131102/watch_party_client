import { BaseEntity } from "./index";

export interface UserProfile extends BaseEntity {
    userId: string;
    isPremium: boolean;
    premiumExpiresAt: Date | null;
    fullName: string | null;
    avatarUrl: string | null;
}
