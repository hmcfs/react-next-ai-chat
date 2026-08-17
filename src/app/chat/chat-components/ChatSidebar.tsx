'use client';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { clientApi } from '@/lib/http/client-api';
import { useAuthStore } from '@/lib/store';
import type { UserInfo } from '@/types/user.type';
import { Download, MoreHorizontal, Pencil, Pin, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { CustomDialog } from './CustomDialog';
import SideBarLoading from './SideBarLoading';

interface ChatSidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSelectChat: (chatId: string) => void;
}
interface HistoryList {
  title: string;
  updateTime: string;
  isDeleted?: boolean;
  chatId: string;
  createTime: string;
  isPinned?: boolean;
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

// 导出的历史消息结构（与 /api/bff/chat/history/:chatId 返回对齐）
type ExportMessage = {
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  reasoningContent?: string;
  modelName?: string;
  createTime?: string;
};

const DATE_TYPE = ['置顶', '今天', '最近', '30天内', '更早'];

// ==================== 导出辅助（模块级，与组件一体） ====================

/** 把消息列表组装成 Markdown 文本 */
function buildExportMarkdown(title: string, messages: ExportMessage[]): string {
  const lines: string[] = [`# ${title}`, ''];
  for (const msg of messages) {
    if (msg.role === 'system') continue;
    const who = msg.role === 'user' ? '**你**' : '**Clair**';
    const meta = [
      msg.modelName,
      msg.createTime ? new Date(msg.createTime).toLocaleString('zh-CN') : '',
    ]
      .filter(Boolean)
      .join(' · ');
    lines.push(`> ${who}${meta ? `（${meta}）` : ''}`, '');
    if (msg.reasoningContent) {
      lines.push('> 💭 深度思考', ...msg.reasoningContent.split('\n').map((l) => `> ${l}`), '');
    }
    const text = Array.isArray(msg.content)
      ? msg.content
          .map((p) => (p.type === 'image_url' ? `![图片](${p.image_url?.url})` : p.text ?? ''))
          .join('\n')
      : (msg.content ?? '');
    lines.push(text, '', '---', '');
  }
  return lines.join('\n');
}

/** 触发浏览器下载 .md 文件 */
function downloadMarkdown(filename: string, content: string) {
  const safeName = filename.replace(/[\\/:*?"<>|]/g, '_');
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChatSidebar({ open, setOpen, onSelectChat }: ChatSidebarProps) {
  const [list, setList] = useState<GroupList[]>([]);
  const [page, setPage] = useState(1);
  const categoryList = (ListArray: HistoryList[]): GroupList[] => {
    if (!ListArray.length) return [];
    const start = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const day = 24 * 60 * 60 * 1000;
    const collectList: GroupList[] = Array.from({ length: DATE_TYPE.length }, (item, index) => ({
      group: DATE_TYPE[index],
      list: [],
    }));

    ListArray.sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    ).forEach((i) => {
      const date = new Date(i.updateTime).getTime();
      if (i.isPinned) {
        return collectList[0].list.push(i);
      }
      if (date >= start) {
        return collectList[1].list.push(i);
      }
      if (start - date <= day * 7) {
        return collectList[2].list.push(i);
      }
      if (start - date <= day * 30) {
        return collectList[3].list.push(i);
      }
      return collectList[4].list.push(i);
    });
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
  const { userInfo, setUserInfo } = useAuthStore(
    useShallow((state) => ({
      userInfo: state.userInfo,
      setUserInfo: state.setUserInfo,
    }))
  );

  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const lastScrollTop = useRef(0);
  const onLoadMore = async () => {
    setLoading(true);

    setPage(page + 1);

    let data: PageHistoryResult | undefined;
    try {
      data = (
        await clientApi.get<PageHistoryResult>(`/api/bff/chat/session?page=${page + 1}&pageSize=15`)
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
        if (hasMore && !loading) {
          onLoadMore();
        }
      }
    },
    [onLoadMore]
  );

  // 重新拉取第一页（置顶 / 重命名 / 删除后刷新排序）
  const loadFirstPage = async () => {
    lastScrollTop.current = 0;
    const data = (
      await clientApi.get<PageHistoryResult>('/api/bff/chat/session?page=1&pageSize=15')
    )?.data;
    setList(categoryList(data?.historyList || []));
    setPage(data?.page || 1);
    setHasMore((data?.historyList?.length ?? 0) >= 15);
  };

  useEffect(() => {
    const init = async () => {
      await loadFirstPage();
      if (!userInfo) {
        const { data } = await clientApi.get<UserInfo>(`/api/bff/user`);
        setUserInfo(data!);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== 会话操作：重命名 / 导出 / 置顶 / 删除 ==========
  const [renameTarget, setRenameTarget] = useState<HistoryList | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HistoryList | null>(null);

  const openRename = (chat: HistoryList) => {
    setRenameValue(chat.title);
    setRenameTarget(chat);
  };
  const saveRename = async () => {
    if (!renameTarget) return;
    const title = renameValue.trim();
    if (!title) {
      toast.warning('标题不能为空');
      return;
    }
    const res = await clientApi.patch<{ chatId: string }>(
      `/api/bff/chat/session/${renameTarget.chatId}`,
      { title }
    );
    if (res?.code === 1) {
      toast.success('已重命名');
      loadFirstPage();
    } else {
      toast.error(res?.msg || '重命名失败');
    }
    setRenameTarget(null);
  };
  const togglePin = async (chat: HistoryList) => {
    const next = !chat.isPinned;
    const res = await clientApi.patch<{ chatId: string }>(
      `/api/bff/chat/session/${chat.chatId}/pin`,
      { isPinned: next }
    );
    if (res?.code === 1) {
      toast.success(next ? '已置顶' : '已取消置顶');
      loadFirstPage();
    } else {
      toast.error(res?.msg || '操作失败');
    }
  };
  const doDelete = async () => {
    if (!deleteTarget) return;
    const res = await clientApi.delete<{ chatId: string }>(
      `/api/bff/chat/session/${deleteTarget.chatId}`
    );
    if (res?.code === 1) {
      toast.success('已删除');
      loadFirstPage();
    } else {
      toast.error(res?.msg || '删除失败');
    }
    setDeleteTarget(null);
  };
  const exportChat = async (chat: HistoryList) => {
    try {
      const res = await clientApi.get<{ messages: ExportMessage[] }>(
        `/api/bff/chat/history/${chat.chatId}`,
        { page: 1, pageSize: 100 }
      );
      const messages = res?.data?.messages ?? [];
      if (!messages.length) {
        toast.warning('暂无对话内容');
        return;
      }
      downloadMarkdown(chat.title || '会话', buildExportMarkdown(chat.title, messages));
      toast.success('已导出对话');
    } catch {
      toast.error('导出失败');
    }
  };
  // 当前选中对话ID
  const [activeChatId, setActiveChatId] = useState<string>('');

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
  // 会话历史列表：可滚动、按日期分组、触底加载（与组件一体，直接闭包访问状态）
  const renderChatHistory = () => (
    <SidebarContent className="">
      <ScrollArea onScroll={handleScroll} className="h-full scroll-wrap-mask">
        {list?.length > 0 &&
          list.map((i) => (
            <SidebarGroup key={i.group}>
              {i.list.length > 0 && i.group && (
                <>
                  {i.group !== '' && (
                    <SidebarGroupLabel className="text-muted-foreground font-normal">
                      {i.group}
                    </SidebarGroupLabel>
                  )}
                  <SidebarMenu>
                    {i.list.map((chat) => (
                      <SidebarMenuItem key={chat.chatId}>
                        <div className="group/item relative w-full">
                          <SidebarMenuButton
                            isActive={activeChatId === chat.chatId}
                            onClick={() => {
                              setActiveChatId(chat.chatId);
                              onSelectChat(chat.chatId);
                            }}
                            className={`pr-8 justify-between hover:!bg-accent cursor-pointer ${
                              activeChatId === chat.chatId
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'
                                : ''
                            }`}
                          >
                            {chat.isPinned && <Pin className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{chat.title}</span>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label="会话操作"
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-opacity ${
                                  activeChatId === chat.chatId
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100'
                                }`}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              className="w-40 z-[10000] border border-border bg-popover shadow-lg ring-foreground/20"
                            >
                              <DropdownMenuItem onSelect={() => openRename(chat)}>
                                <Pencil className="w-4 h-4" /> 重命名
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => exportChat(chat)}>
                                <Download className="w-4 h-4" /> 导出对话
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => togglePin(chat)}>
                                <Pin className="w-4 h-4" /> {chat.isPinned ? '取消置顶' : '置顶'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleteTarget(chat)}
                              >
                                <Trash2 className="w-4 h-4" /> 删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </>
              )}
            </SidebarGroup>
          ))}
        <SideBarLoading loading={loading} />
      </ScrollArea>
    </SidebarContent>
  );

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
                className="w-5 h-5 text-muted-foreground cursor-pointer"
              />
              <div className="w-5 h-5 relative cursor-pointer" onClick={() => setOpen(!open)}>
                <Image src="/hidden.svg" fill alt="hidden" className="w-full  h-full " />
              </div>
            </div>
          </div>

          {/* 开启新对话按钮 */}
          <Button
            onClick={newSession}
            className="w-full cursor-pointer gap-2 rounded-full bg-card border text-foreground hover:shadow-md hover:translate-y-[-1px] hover:bg-card shadow-sm"
          >
            开启新对话
          </Button>
        </SidebarHeader>

        {renderChatHistory()}

        {/* 底部用户栏 */}
        <SidebarFooter className="px-4 py-2 bg-sidebar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{userInfo?.nickname?.toString().slice(0, 2)}</AvatarFallback>
              </Avatar>
              <strong>{userInfo?.nickname}</strong>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* 重命名对话框 */}
      <Dialog open={renameTarget !== null} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重命名会话</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveRename()}
            placeholder="请输入新标题"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              取消
            </Button>
            <Button onClick={saveRename}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除会话</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确认删除「{deleteTarget?.title}」？删除后不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={doDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
