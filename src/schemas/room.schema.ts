import { z } from "zod";
import { RoomType } from "../types/room.types";

export const createRoomSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vui lòng nhập tên phòng")
      .min(3, "Tên phòng phải có ít nhất 3 ký tự")
      .max(100, "Tên phòng không được quá 100 ký tự"),
    type: z.nativeEnum(RoomType),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === RoomType.PRIVATE) {
        return data.password && data.password.trim().length > 0;
      }
      return true;
    },
    {
      message: "Vui lòng nhập mật khẩu cho phòng riêng tư",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.type === RoomType.PRIVATE && data.password) {
        return data.password.length >= 4;
      }
      return true;
    },
    {
      message: "Mật khẩu phải có ít nhất 4 ký tự",
      path: ["password"],
    }
  );

export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
