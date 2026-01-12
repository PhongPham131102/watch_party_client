import { BaseEntity, User } from "./index";

export interface Comment extends BaseEntity {
    userId: string;
    movieId: string;
    content: string;
    parentCommentId: string | null;
    user: User;
    replies?: Comment[];
    _count?: {
        replies: number;
    };
}

export interface CreateCommentDto {
    movieId: string;
    content: string;
    parentCommentId?: string;
}

export interface CommentResponse {
    data: Comment[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
