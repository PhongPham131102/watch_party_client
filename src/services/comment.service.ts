import { post, get, del } from "./api.service";
import { Comment, CreateCommentDto, CommentResponse } from "../types/comment.types";

class CommentService {
    private readonly BASE_URL = "/comments";

    async createComment(dto: CreateCommentDto): Promise<Comment> {
        const response = await post<{ data: Comment }>(
            this.BASE_URL,
            dto
        );
        return response.data;
    }

    async getMovieComments(
        movieId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<CommentResponse> {
        const response = await get<{ data: CommentResponse }>(
            `${this.BASE_URL}/movie/${movieId}?page=${page}&limit=${limit}`
        );
        return response.data;
    }

    async getReplies(commentId: string): Promise<Comment[]> {
        const response = await get<{ data: Comment[] }>(
            `${this.BASE_URL}/${commentId}/replies`
        );
        return response.data;
    }

    async deleteComment(commentId: string): Promise<boolean> {
        const response = await del<{ data: boolean }>(
            `${this.BASE_URL}/${commentId}`
        );
        return response.data;
    }
}

export default new CommentService();
