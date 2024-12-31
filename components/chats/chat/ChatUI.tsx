import { createContext, useContext, useEffect, useState } from 'react';
import Chat from './Chat';
import ChatSettings from './ChatSettings';
import ChatDrawer from './ChatDrawer';
import { useRouter } from 'next/router';
import { useFetch } from '../hooks';
import { ApiSuccess } from '../types';
import { ChatContext } from '../provider';
import { LLMConversation } from './types';
import useTeam from 'hooks/useTeam';
import { Loading } from '../shared';
import { Menu, Plus } from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface ConversationContextType {
  selectedConversation?: LLMConversation;
  isLoadingConversations: boolean;
  isChatWithPDFProvider: boolean;
  setIsChatWithPDFProvider: (value: boolean) => void;
}

export const ConversationContext =
  createContext<ConversationContextType | null>(null);

export function ChatUI({ slug }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const conversationId = router.query.conversationId?.[0] as string;

  const setConversationId = (newConversationId: string) => {
    const basePath = router.pathname.split('/[[...conversationId]]')[0];
    const conversationRoute = basePath.split('/[slug]').join(`/${slug}`);

    if (newConversationId === '') {
      router.push(conversationRoute);
    } else {
      router.push(`${conversationRoute}/${newConversationId}`);
    }
  };

  const { urls } = useContext(ChatContext);

  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: reloadConversations,
  } = useFetch<ApiSuccess<LLMConversation[]>>({ url: urls?.conversation });

  const conversations = conversationsData?.data;

  useEffect(() => {
    if (conversationId) {
      reloadConversations();
    }
  }, [conversationId, reloadConversations]);

  const [isChatDrawerVisible, setIsChatDrawerVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChatWithPDFProvider, setIsChatWithPDFProvider] = useState(false);

  const toggleChatDrawerVisibility = () => {
    setIsChatDrawerVisible(!isChatDrawerVisible);
  };

  const selectedConversation = conversations?.find(
    (c) => c.id === conversationId
  );

  const { isLoading } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ConversationContext.Provider
      value={{
        selectedConversation,
        isLoadingConversations,
        isChatWithPDFProvider,
        setIsChatWithPDFProvider,
      }}
    >
      <div className="w-full h-screen relative flex bg-gray-50 border border-gray-200 rounded-lg shadow-md">
        <ChatDrawer
          isChatDrawerVisible={isChatDrawerVisible}
          toggleChatDrawerVisibility={toggleChatDrawerVisibility}
          setShowSettings={setShowSettings}
          conversations={conversations}
          conversationId={conversationId}
          setConversationId={setConversationId}
        />
        <div className="flex max-w-full flex-col w-full h-screen">
          <div className="sticky top-0 z-10 flex items-center border-b border-white/20 bg-gray-800 pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white"
              onClick={toggleChatDrawerVisibility}
            >
              <span className="sr-only">{t('bui-chat-open-sidebar')}</span>
              <Menu className="h-6 w-6 text-white" />
            </button>
            <h1 className="flex-1 text-center text-base font-normal">
              {showSettings
                ? t('settings')
                : selectedConversation?.title || t('bui-chat-new-chat')}
            </h1>
            <button
              type="button"
              className="px-3"
              onClick={() => {
                setConversationId('');
                setShowSettings(false);
              }}
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 max-h-screen h-screen p-4 bg-white border-t border-gray-300 rounded-b-lg shadow-inner">
            {showSettings ? (
              <div className="p-4 border-t border-gray-300 bg-white rounded-b-lg shadow-inner">
                <ChatSettings />
              </div>
            ) : (
              <div className="h-screen border-t border-gray-300 bg-white rounded-b-lg shadow-inner">
                <Chat
                  setShowSettings={setShowSettings}
                  conversationId={conversationId}
                  setConversationId={setConversationId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ConversationContext.Provider>
  );
}
