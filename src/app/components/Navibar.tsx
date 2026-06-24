'use client';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Square, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useSidebarVisible } from '@/hooks/useSidebarVisible';
import { Dispatch, SetStateAction } from 'react';
// 模拟数据类型
interface ChatRecord {
  id: string;
  title: string;
  group: '昨天' | '30天内';
}

// 模拟对话列表数据
const mockChatList: ChatRecord[] = [
  { id: '1', title: 'NestJS控制器代码修正', group: '昨天' },
  { id: '2', title: 'nestjs-cls内存存储说明', group: '30天内' },
  { id: '3', title: '下拉菜单改弹窗替换', group: '30天内' },
  { id: '4', title: 'NestJS共享attrs方法', group: '30天内' },
  { id: '5', title: '异步上下文管理代码解释', group: '30天内' },
  { id: '6', title: 'VSCode调试Edge浏览器配置', group: '30天内' },
  { id: '7', title: 'NestJS装饰器错误处理', group: '30天内' },
  { id: '8', title: '非递归DFS实现方法', group: '30天内' },
  { id: '9', title: 'NestJS Fastify Redis连接测试', group: '30天内' },
  { id: '10', title: '桶排序处理负数', group: '30天内' },
  { id: '11', title: 'Git日志提交解释', group: '30天内' },
  { id: '12', title: 'NestJS Fastify Redis连接测试', group: '30天内' },
  { id: '13', title: 'NestJS Fastify Redis连接测试', group: '30天内' },
  { id: '14', title: 'NestJS Fastify Redis连接测试', group: '30天内' },
  { id: '15', title: 'NestJS Fastify Redis连接测试', group: '30天内' },
];
interface ChatSidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export default function ChatSidebar({ open, setOpen }: ChatSidebarProps) {
  // 当前选中对话ID
  const [activeChatId, setActiveChatId] = useState<string>('1');

  // 按分组归类数据
  const groupData = {
    昨天: mockChatList.filter((item) => item.group === '昨天'),
    '30天内': mockChatList.filter((item) => item.group === '30天内'),
  };
  const { isCollapsed, ref } = useSidebarVisible();
  console.log(isCollapsed);
  return (
    <Sidebar className="border-r w-full" collapsible="none">
      {/* 侧边栏头部：Logo + 搜索图标 + 窗口图标 */}
      <SidebarHeader className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center  text-2xl font-bold  ">
            <div className="flex items-center  ">
              <AspectRatio ratio={1} className="mt-1.5 rounded-[50%] w-8 h-8 bg-muted">
                <Image
                  src="/font2.png"
                  alt="logo"
                  fill
                  className="w-full rounded-lg object-cover dark:brightness-90"
                />
              </AspectRatio>
              <span className="w-10 h-10 "></span>
            </div>
            <div className="text-lg ml-4 text-[24px] font-bold">Clair</div>
          </div>
          <div className="flex gap-3">
            <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
            <div className="w-5 h-5 relative cursor-pointer" onClick={() => setOpen(!open)}>
              <Image src="/hidden.svg" fill alt="hidden" className="w-full  h-full " />
            </div>
          </div>
        </div>

        {/* 开启新对话按钮 */}
        <Button className="w-full cursor-pointer gap-2 rounded-full bg-white border text-black hover:shadow-md hover:translate-y-[-1px] hover:bg-white shadow-sm">
          开启新对话
        </Button>
      </SidebarHeader>

      {/* 滚动对话列表区域 */}
      <SidebarContent className="">
        <ScrollArea className="h-[calc(100vh-200px)]">
          {/* 分组：昨天 */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400 font-normal">昨天</SidebarGroupLabel>
            <SidebarMenu>
              {groupData['昨天'].map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={activeChatId === chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="justify-between group-data-[active=true]:bg-blue-50 group-data-[active=true]:text-blue-600"
                  >
                    <span className="truncate">{chat.title}</span>
                    <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          {/* 分组：30天内 */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400 font-normal">30天内</SidebarGroupLabel>
            <SidebarMenu>
              {groupData['30天内'].map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={activeChatId === chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="justify-between group-data-[active=true]:bg-blue-50 group-data-[active=true]:text-blue-600"
                  >
                    <span className="truncate">{chat.title}</span>
                    <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      {/* 底部用户栏 */}
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback>hh</AvatarFallback>
            </Avatar>
            <span>hh</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
