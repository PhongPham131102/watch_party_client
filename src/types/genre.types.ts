// Genre, Director, Actor, Country types from API
export interface Genre {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}