import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
const titleList = ['历史对话', '我的收藏'];
export function CustomDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* onInteractOutside={(e) => e.preventDefault()} */}
      <DialogContent className="gap-0">
        <DialogHeader className="relative flex flex-row items-center justify-around  mb-2">
          {/*  绝对定位在父容器底部 */}
          <div
            className="absolute bottom-0 h-[3px] w-[17%] bg-black rounded-lg transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${activeTab * 300}%)`,
              left: '16%',
            }}
          />

          {titleList.map((i, index) => {
            const isActive = activeTab === index;
            return (
              <DialogTitle
                key={index}
                className="flex items-center flex-col cursor-pointer py-2 w-1/3"
                onClick={() => setActiveTab(index)}
              >
                <span
                  className={`
                text-lg w-full text-center mx-auto
                transition-colors duration-300 ease-out
                ${isActive ? 'text-black font-bold' : 'text-gray-400'}
              `}
                >
                  {i}
                </span>
              </DialogTitle>
            );
          })}
        </DialogHeader>
        <div className="w-full h-full my-1 relative">
          <Search className="absolute right-2 top-[20%] w-5 h-5 text-gray-500 cursor-pointer" />
          <Input placeholder="搜索" />
        </div>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
