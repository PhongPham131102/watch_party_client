import { toast as sonnerToast } from "sonner";

export const toast = {
    success: (message: string, description?: string) => {
        sonnerToast.success(message, {
            description,
            duration: 3000,
            style: {

                color: "#1ed760",

            },
        });
    },

    error: (message: string, description?: string) => {
        sonnerToast.error(message, {
            description,
            duration: 4000,
            style: {

                color: "#ef4444",

            },
        });
    },

    info: (message: string, description?: string) => {
        sonnerToast.info(message, {
            description,
            duration: 3000,
            style: {

                color: "#3b82f6",

            },
        });
    },

    warning: (message: string, description?: string) => {
        sonnerToast.warning(message, {
            description,
            duration: 3000,
            style: {

                color: "#f59e0b",

            },
        });
    },

    loading: (message: string) => {
        return sonnerToast.loading(message, {
            style: {

                color: "#ffffff",

            },
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
            style: {

                color: "#ffffff",
            }
        });
    },

    dismiss: (toastId?: string | number) => {
        sonnerToast.dismiss(toastId);
    },
};
