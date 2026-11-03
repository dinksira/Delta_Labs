"use client";

import React, { useState } from 'react';
import { QAPageLayout } from '../components/qa/templates/QAPageLayout';
import { type SideTabId } from '../components/qa/organisms/SideNav';
import { TabNav, type QATabId } from '../components/qa/molecules/TabNav';
import { SearchBar } from '../components/qa/molecules/SearchBar';
import { QuestionList } from '../components/qa/organisms/QuestionList';
import { LiveList } from '../components/qa/organisms/LiveList';
import { NotificationList } from '../components/qa/organisms/NotificationList';
import { PaymentView } from '../components/qa/organisms/PaymentView';

export const MyQuestionsPage: React.FC = () => {
  const [activeSideTab, setActiveSideTab] = useState<SideTabId>('my-questions');
  const [activeQaTab, setActiveQaTab] = useState<QATabId>('my-questions');

  const handleAskQuestion = () => {
    // Navigate or open ask question view
    console.log("Ask Question clicked");
  };

  const renderContent = () => {
    switch (activeSideTab) {
      case 'bookmark':
        return <QuestionList isBookmarkedView={true} />;
      case 'notification':
        return <NotificationList />;
      case 'live':
        return <LiveList />;
      case 'payment':
        return <PaymentView />;
      case 'my-questions':
      case 'community':
      case 'network':
      default:
        return (
          <>
            <TabNav 
              activeTab={activeQaTab} 
              onTabChange={setActiveQaTab} 
              onAskQuestion={handleAskQuestion}
            />
            <SearchBar />
            <QuestionList />
          </>
        );
    }
  };

  return (
    <QAPageLayout 
      activeSideTab={activeSideTab} 
      onSideTabChange={setActiveSideTab}
    >
      {renderContent()}
    </QAPageLayout>
  );
};


