'use client';
import SideBarLoading from '@/app/components/SideBarLoading';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSidebarVisible } from '@/hooks/useSidebarVisible';
import { clientApi } from '@/lib/client-request';
import { MoreHorizontal, Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CustomDialog } from '../chat/components/CustomDialog';
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
interface HistoryList {
  title: string;
  updateTime: string;
  isDeleted?: boolean;
  chatId: string;
  createTime: string;
}
interface PageHistoryResult {
  page: number;
  pageSize: number;
  historyList: HistoryList[];
}
interface GroupList {
  group: string;
  list: HistoryList[];
}
const DATE_TYPE = ['今天', '近一周', '30天内', '更早'];
export default function ChatSidebar({ open, setOpen }: ChatSidebarProps) {
  const [list, setList] = useState<GroupList[]>([]);
  const [page, setPage] = useState(1);
  const categoryList = (ListArray: HistoryList[]): GroupList[] => {
    if (!ListArray.length) return [];
    const start = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    console.log('standard', start);
    console.log('curTime:', new Date().getTime());
    // const start=new Date(cloneList[0].updateTime).getTime();
    // const end=new Date(cloneList[cloneList.length-1].updateTime).getTime();
    const day = 24 * 60 * 60 * 1000;
    const collectList: GroupList[] = Array.from({ length: DATE_TYPE.length }, (item, index) => ({
      group: DATE_TYPE[index],
      list: [],
    }));

    ListArray.sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    ).forEach((i, _index) => {
      const date = new Date(i.updateTime).getTime();
      //console.log('diff', start - date);
      if (date >= start) {
        return collectList[0].list.push(i);
      }
      if (start - date <= day * 7) {
        return collectList[1].list.push(i);
      }
      if (start - date <= day * 30) {
        return collectList[2].list.push(i);
      }
      return collectList[3].list.push(i);
    });
    console.log('collectList', collectList);
    return collectList;
  };
  const mergeGroupList = (arr1: GroupList[], arr2: GroupList[]): GroupList[] => {
    const map = new Map<string, HistoryList[]>();
    arr1.forEach((i) => {
      map.set(i.group, i.list);
    });
    arr2.forEach((i) => {
      const filterMap = new Map();
      i.list.forEach((j, index) => {
        if (!filterMap.has(j.chatId)) {
          filterMap.set(j.chatId, j);
        } else {
          i.list.splice(index, 1);
        }
      });
      if (map.has(i.group)) {
        map.set(i.group, [...map.get(i.group)!, ...i.list]);
      } else {
        map.set(i.group, i.list);
      }
    });
    return Array.from(map.entries()).map(([group, list]) => ({ group, list }));
  };
  useEffect(() => {
    const getList = async () => {
      const data = (
        await clientApi.get<PageHistoryResult>(`/api/chat/session?page=${page}&pageSize=15`)
      )?.data;

      setList(categoryList(data?.historyList || []));
      setPage(data?.page || 1);
    };
    getList();
  }, []);
  useEffect(() => {
    console.log('pageList', list);
  }, [list]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const lastScrollTop = useRef(0);
  const onLoadMore = async () => {
    setLoading(true);

    setPage(page + 1);

    let data: PageHistoryResult | undefined;
    try {
      data = (
        await clientApi.get<PageHistoryResult>(`/api/chat/session?page=${page + 1}&pageSize=15`)
      )?.data;
      if (!data || data.historyList.length === 0) {
        setHasMore(false);
        return;
      }

      setList(mergeGroupList(list, categoryList(data.historyList)));
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (scrollTop <= lastScrollTop.current) {
        lastScrollTop.current = scrollTop;
        return;
      }
      lastScrollTop.current = scrollTop;
      if (scrollHeight - scrollTop - clientHeight <= 50) {
        console.log('到底了');
        // console.log(hasMore, loading);
        if (hasMore && !loading) {
          onLoadMore();
        }
      }
    },
    [onLoadMore]
  );
  // 当前选中对话ID
  const [activeChatId, setActiveChatId] = useState<string>('');

  // 按分组归类数据
  const groupData = {
    昨天: mockChatList.filter((item) => item.group === '昨天'),
    '30天内': mockChatList.filter((item) => item.group === '30天内'),
  };
  const { isCollapsed, ref } = useSidebarVisible();
  // console.log(isCollapsed);
  const path = usePathname();
  const router = useRouter();

  const [showDialog, setShowDialog] = useState(false);
  const newSession = () => {
    if (path === '/chat') {
      toast.warning('已是最新会话');
      return;
    }
    router.push('/chat');
  };
  return (
    <>
      <CustomDialog open={showDialog} setOpen={setShowDialog} />
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
              <Search
                onClick={() => setShowDialog(true)}
                className="w-5 h-5 text-gray-500 cursor-pointer"
              />
              <div className="w-5 h-5 relative cursor-pointer" onClick={() => setOpen(!open)}>
                <Image src="/hidden.svg" fill alt="hidden" className="w-full  h-full " />
              </div>
            </div>
          </div>

          {/* 开启新对话按钮 */}
          <Button
            onClick={newSession}
            className="w-full cursor-pointer gap-2 rounded-full bg-white border text-black hover:shadow-md hover:translate-y-[-1px] hover:bg-white shadow-sm"
          >
            开启新对话
          </Button>
        </SidebarHeader>

        {/* 滚动对话列表区域 */}
        <SidebarContent className="">
          <ScrollArea onScroll={handleScroll} className="h-full scroll-wrap-mask">
            {list?.length > 0 &&
              list.map((i, index) => (
                <SidebarGroup key={i.group}>
                  {i.list.length > 0 && i.group && (
                    <>
                      {i.group !== '' && (
                        <SidebarGroupLabel className="text-gray-400 font-normal">
                          {i.group}
                        </SidebarGroupLabel>
                      )}
                      <SidebarMenu>
                        {i.list.map((chat, index) => (
                          <SidebarMenuItem key={chat.chatId}>
                            <SidebarMenuButton
                              isActive={activeChatId === chat.chatId}
                              onClick={() => setActiveChatId(chat.chatId)}
                              className="justify-between group hover:!bg-gray-100 cursor-pointer"
                              style={
                                activeChatId === chat.chatId
                                  ? { background: '#eff6ff', color: '#76adf5' }
                                  : { background: 'transparent' }
                              }
                            >
                              <span className="truncate">{chat.title}</span>
                              <MoreHorizontal
                                className={`w-4 h-4 opacity-0 ${activeChatId === chat.chatId ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-500 `}
                              />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </>
                  )}
                </SidebarGroup>
              ))}
            <SideBarLoading loading={loading} />
            {/*  
 
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
            </SidebarGroup> */}
          </ScrollArea>
        </SidebarContent>

        {/* 底部用户栏 */}
        <SidebarFooter className="px-4 py-2 bg-white  ">
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
    </>
  );
}
