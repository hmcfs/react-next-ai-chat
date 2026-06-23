import { Navibar } from '../components/Navibar';
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="w-[var(--chat-layout-side)] flex h-screen  bg-gray-50">
        <Navibar></Navibar>
      </div>
      <div className="flex-1  h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
