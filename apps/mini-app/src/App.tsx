import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import HomeScreen from "./pages/HomeScreen";
import AssistantScreen from "./pages/AssistantScreen";
import ChatScreen from "./pages/ChatScreen";
import NeighborhoodScreen from "./pages/NeighborhoodScreen";
import NeighborhoodDetailScreen from "./pages/NeighborhoodDetailScreen";
import NewsListScreen from "./pages/NewsListScreen";
import NewsDetailScreen from "./pages/NewsDetailScreen";
import PostNewsScreen from "./pages/PostNewsScreen";
import FeedbackScreen from "./pages/FeedbackScreen";
import FeedbackFormScreen from "./pages/FeedbackFormScreen";
import FeedbackTrackScreen from "./pages/FeedbackTrackScreen";
import FeedbackGuideScreen from "./pages/FeedbackGuideScreen";
import NotificationsScreen from "./pages/NotificationsScreen";
import ProfileScreen from "./pages/ProfileScreen";
import SuggestionScreen from "./pages/SuggestionScreen";
import UtilitiesScreen from "./pages/UtilitiesScreen";
import MapScreen from "./pages/MapScreen";
import WasteScreen from "./pages/WasteScreen";
import SavedScreen from "./pages/SavedScreen";

// ─── ROUTER: MỖI MÀN HÌNH GIỜ LÀ 1 TRANG VỚI URL RIÊNG ─────────────────────
// Trước đây toàn bộ ứng dụng nằm trong 1 file App.tsx duy nhất và "chuyển
// trang" chỉ là đổi 1 biến state (không có URL, không dùng được nút back của
// trình duyệt, không share/bookmark được 1 trang cụ thể). Giờ mỗi màn hình là
// 1 file riêng trong thư mục pages/, được gắn với 1 route cụ thể bên dưới.
// <Layout /> giữ khung điện thoại + thanh điều hướng dưới cùng dùng chung cho
// mọi trang, còn nội dung từng trang render qua <Outlet /> bên trong Layout.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeScreen />} />
        <Route path="assistant" element={<AssistantScreen />} />
        <Route path="chat" element={<ChatScreen />} />

        <Route path="neighborhood" element={<NeighborhoodScreen />} />
        <Route path="neighborhood/:hoodId" element={<NeighborhoodDetailScreen />} />

        <Route path="news" element={<NewsListScreen />} />
        <Route path="news/new" element={<PostNewsScreen />} />
        <Route path="news/:newsId" element={<NewsDetailScreen />} />

        <Route path="feedback" element={<FeedbackScreen />} />
        <Route path="feedback/new" element={<FeedbackFormScreen />} />
        <Route path="feedback/track" element={<FeedbackTrackScreen />} />
        <Route path="feedback/guide" element={<FeedbackGuideScreen />} />

        <Route path="notifications" element={<NotificationsScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="suggestion" element={<SuggestionScreen />} />
        <Route path="saved" element={<SavedScreen />} />

        <Route path="utilities" element={<UtilitiesScreen />} />
        <Route path="map" element={<MapScreen />} />
        <Route path="waste" element={<WasteScreen />} />

        {/* Đường dẫn không xác định -> quay về trang chủ */}
        <Route path="*" element={<HomeScreen />} />
      </Route>
    </Routes>
  );
}
