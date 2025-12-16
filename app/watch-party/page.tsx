"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Film,
  Play,
  MessageSquare,
  ListVideo,
  Plus,
  Users,
  Video,
  Share2,
  Check,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { useAuthStore } from "@/src/store/auth.store";
import { Input } from "@/components/ui/input";
import CreateRoomDialog from "@/src/components/CreateRoomDialog";
import { roomService } from "@/src/services/room.service";
import { toast } from "@/src/utils/toast";

function WatchPartyContent() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const { user } = useAuthStore();
  const roomsPerPage = 8;

  const features = [
    {
      icon: <Film className="w-12 h-12" />,
      title: "DANH SÁCH PHIM ĐA DẠNG",
      description:
        "Thư viện phim phong phú từ các thể loại khác nhau cho bạn lựa chọn.",
    },
    {
      icon: <Play className="w-12 h-12" />,
      title: "SYNCHRONIZED PLAY",
      description: "Phát video đồng bộ hoàn hảo, cùng xem cùng lúc với bạn bè.",
    },
    {
      icon: <MessageSquare className="w-12 h-12" />,
      title: "CHAT",
      description: "Trò chuyện theo thời gian thực, chia sẻ cảm xúc cùng nhau.",
    },
    {
      icon: <ListVideo className="w-12 h-12" />,
      title: "PLAYLISTS",
      description: "Tạo và quản lý danh sách phát riêng của bạn.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Tạo phòng",
      description: "Nhấn nút 'Tạo Phòng' để bắt đầu",
      icon: <Plus className="w-6 h-6" />,
    },
    {
      number: "2",
      title: "Chia sẻ link",
      description: "Gửi link phòng cho bạn bè",
      icon: <Share2 className="w-6 h-6" />,
    },
    {
      number: "3",
      title: "Chọn phim",
      description: "Chọn phim từ thư viện để xem",
      icon: <Film className="w-6 h-6" />,
    },
    {
      number: "4",
      title: "Thành công!",
      description: "Cùng nhau tận hưởng",
      icon: <Check className="w-6 h-6" />,
    },
  ];

  // Mock data for public rooms
  const publicRooms = [
    {
      id: "1",
      name: "Phòng xem phim Marvel",
      host: "Nguyễn Văn A",
      currentMovie: "Spider-Man: No Way Home",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 15,
      isPublic: true,
      createdAt: "2 giờ trước",
    },
    {
      id: "2",
      name: "Anime Night 🎌",
      host: "Trần Thị B",
      currentMovie: "Your Name",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 8,
      isPublic: true,
      createdAt: "30 phút trước",
    },
    {
      id: "3",
      name: "Phim Hành Động Hay",
      host: "Lê Văn C",
      currentMovie: "John Wick 4",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 23,
      isPublic: true,
      createdAt: "1 giờ trước",
    },
    {
      id: "4",
      name: "Chill với phim Hàn",
      host: "Phạm Thị D",
      currentMovie: "Parasite",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 12,
      isPublic: true,
      createdAt: "45 phút trước",
    },
    {
      id: "5",
      name: "Horror Movie Marathon",
      host: "Hoàng Văn E",
      currentMovie: "The Conjuring",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 6,
      isPublic: true,
      createdAt: "3 giờ trước",
    },
    {
      id: "6",
      name: "Comedy Night",
      host: "Vũ Thị F",
      currentMovie: "The Hangover",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 18,
      isPublic: true,
      createdAt: "1 giờ trước",
    },
    {
      id: "7",
      name: "Sci-Fi Lovers",
      host: "Đỗ Văn G",
      currentMovie: "Interstellar",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 20,
      isPublic: true,
      createdAt: "2 giờ trước",
    },
    {
      id: "8",
      name: "Romance & Drama",
      host: "Bùi Thị H",
      currentMovie: "The Notebook",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 10,
      isPublic: true,
      createdAt: "4 giờ trước",
    },
    {
      id: "9",
      name: "Phòng Phim Việt",
      host: "Đinh Văn I",
      currentMovie: "Mắt Biếc",
      thumbnail: "/zootopia-preview.jpg",
      viewers: 25,
      isPublic: true,
      createdAt: "1 giờ trước",
    },
  ];

  const totalPages = Math.ceil(publicRooms.length / roomsPerPage);
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = publicRooms.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: document.getElementById("public-rooms")?.offsetTop,
      behavior: "smooth",
    });
  };

  const handleCreateRoom = () => {
    setIsCreateModalOpen(true);
  };

  const handleJoinRoom = async () => {
    const code = roomCode.trim();
    
    if (!code) {
      toast.error("Vui lòng nhập mã phòng");
      return;
    }

    setJoiningRoom(true);
    try {
      // Check if room exists
      const response = await roomService.checkRoom(code);
      
      if (response.data) {
        // Room exists, navigate to room detail page
        router.push(`/watch-party/${code}`);
      } else {
        toast.error("Phòng không tồn tại");
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      const errorMessage = error?.message || "Không thể tham gia phòng";
      toast.error(errorMessage);
    } finally {
      setJoiningRoom(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              Cùng nhau xem video với bạn bè ở bất cứ đâu, mọi lúc.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
                tạo phòng để cùng xem ngay!
              </span>
            </h2>

            <p className="text-base text-white/70 max-w-2xl mx-auto">
              Nền tảng cho phép bạn kết nối và xem video đồng thời với bạn bè,
              chia sẻ khoảnh khắc giải trí theo thời gian thực dù mỗi người ở
              một nơi khác nhau.
            </p>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleCreateRoom}
                size="lg"
                className="max-w-60 bg-primary hover:bg-primary/90 text-white px-10 py-4 text-base font-bold  shadow-primary/50  hover:scale-105 transition-all">
                <Plus className="w-6 h-10 mr-2" />
                Tạo Phòng Ngay!
              </Button>

              {/* Join Room Input */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="text-white/50 text-sm">hoặc</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Nhập mã phòng để tham gia..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !joiningRoom) {
                        handleJoinRoom();
                      }
                    }}
                    disabled={joiningRoom}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-red-500/50 focus:ring-red-500/20 disabled:opacity-50"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!roomCode.trim() || joiningRoom}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    {joiningRoom ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang tham gia...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Tham gia
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Video Preview */}
          <div className="relative ">
            {/* Glow effect */}
            <div className="absolute -inset-1  rounded-2xl blur-lg opacity-20 animate-pulse"></div>

            <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="group aspect-video relative overflow-hidden">
                {/* Image preview */}
                <Image
                  src="/zootopia-preview.jpg"
                  alt="Watch Party Preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:rotate-1 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0"></div>
              </div>

              {/* Mini User Avatars */}
              <div className="p-4 bg-black/80 backdrop-blur-sm flex gap-3 items-center border-t border-white/10">
                <Users className="w-5 h-5 text-white/60" />
                {[
                  { id: 1, image: "/avatar_1.webp" },
                  { id: 2, image: "/avatar_2.webp" },
                  { id: 3, image: "/avatar_3.webp" },
                  { id: 4, image: "/avatar_4.webp" },
                ].map((avatar) => (
                  <div key={avatar.id} className="relative group">
                    <div className="w-13 h-13 rounded-full overflow-hidden shadow-lg transition-transform hover:scale-110 ">
                      <Image
                        src={avatar.image}
                        alt={`Avatar ${avatar.id}`}
                        width={52}
                        height={52}
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
                <div className="ml-auto text-white/60 text-sm font-medium">
                  +5 người khác
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative text-center space-y-4 p-8 rounded-2xl bg-linear-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-sm hover:from-red-500/10 hover:via-orange-500/5 hover:to-transparent transition-all duration-500 border border-white/10 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 cursor-pointer overflow-hidden">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-linear-to-br from-red-500/0 via-orange-500/0 to-pink-500/0 group-hover:from-red-500/5 group-hover:via-orange-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-2xl blur-xl"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex justify-center text-red-400 group-hover:text-red-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-all duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-red-500/0 to-transparent group-hover:from-red-500/20 transition-all duration-500 rounded-bl-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Get Started Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Bắt đầu thật{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
              dễ dàng!
            </span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Chỉ với 4 bước đơn giản, bạn đã có thể cùng xem phim với bạn bè
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-1 bg-linear-to-r from-white/10 via-red-500/30 to-white/10"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center text-center space-y-4">
                  {/* Step Number Circle */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500"></div>

                    <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-white/10 to-white/5 backdrop-blur-sm border-2 border-white/20 group-hover:border-red-500/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <div className="absolute inset-2 rounded-full bg-linear-to-br from-red-500/20 to-orange-500/20 group-hover:from-red-500/40 group-hover:to-orange-500/40 transition-all duration-300"></div>

                      <div className="relative z-10 text-white group-hover:text-red-300 transition-all duration-300 group-hover:scale-110">
                        {step.icon}
                      </div>
                    </div>

                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-all duration-300">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300">
                      {step.title}
                    </h3>
                    <p className="text-white/70 text-sm group-hover:text-white/90 transition-all duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Public Rooms Section */}
      <section id="public-rooms" className="container mx-auto px-6 py-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Phòng{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
                  Công Khai
                </span>
              </h2>
              <p className="text-white/70">
                Tham gia ngay các phòng đang hoạt động
              </p>
            </div>
            <Button
              onClick={handleCreateRoom}
              className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tạo Phòng Mới
            </Button>
          </div>

          {/* Rooms List */}
          {currentRooms.length > 0 ? (
            <div className="space-y-3">
              {currentRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-4 p-4">
                    {/* Room Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-base line-clamp-1">
                        {room.name}
                      </h3>
                    </div>

                    {/* Host */}
                    <div className="flex items-center gap-2 text-white/60 text-sm min-w-[150px]">
                      <User className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{room.host}</span>
                    </div>

                    {/* Viewers */}
                    <div className="flex items-center gap-2 text-white/60 text-sm min-w-20">
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="font-medium">{room.viewers}</span>
                    </div>

                    {/* Join Button */}
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white"
                      onClick={() =>
                        router.push(`/watch-party/room/${room.id}`)
                      }>
                      Tham gia
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white/40" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500/20 border-2 border-black flex items-center justify-center">
                  <Video className="w-4 h-4 text-red-400" />
                </div>
              </div>

              <h3 className="text-white text-xl font-bold mb-2">
                Chưa có phòng nào đang hoạt động
              </h3>
              <p className="text-white/60 text-center mb-6 max-w-md">
                Hãy là người đầu tiên tạo phòng và mời bạn bè cùng xem phim nhé!
              </p>

              <Button
                onClick={handleCreateRoom}
                className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Phòng Đầu Tiên
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`${
                      currentPage === page
                        ? "bg-primary text-white border-0"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/30 text-white"
                    } transition-all duration-300`}>
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-red-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Create Room Modal */}
      <CreateRoomDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}

export default function WatchPartyPage() {
  return (
    <ProtectedRoute>
      <WatchPartyContent />
    </ProtectedRoute>
  );
}
