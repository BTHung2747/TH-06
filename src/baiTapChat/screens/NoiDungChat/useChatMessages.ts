import { useCallback, useEffect, useRef, useState } from 'react';
import {
  compareMessages,
  PAGE_SIZE,
  type MessageEntry,
} from '../../../services/chatModel';
import {
  watchMessages,
  watchMessagesSince,
} from '../../../services/chatService';
import { loiFirebase } from '../../../services/firebase';

export const useChatMessages = (id: string) => {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [older, setOlder] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const loadMoreRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stops: (() => void)[] = [];
    const pages: MessageEntry[][] = [];
    let firstStop: (() => void) | undefined;
    let hasOlder = false;
    let fetching = false;
    let closed = false;
    const publish = () => {
      if (closed) return;
      setMessages(pages.flat().sort((a, b) => compareMessages(b, a)));
    };
    const fail = (cause: Error) => {
      if (closed) return;
      setError(loiFirebase(cause));
      setLoading(false);
    };

    setMessages([]);
    setOlder(false);
    setLoading(true);
    setLoadingOlder(false);
    setError('');
    let trackingTail = false;
    firstStop = watchMessages(
      id,
      items => {
        if (trackingTail || closed) return;
        pages[0] = items;
        hasOlder = items.length === PAGE_SIZE;
        setOlder(hasOlder);
        setLoading(false);
        publish();
        if (items[0]) {
          trackingTail = true;
          stops.push(
            watchMessagesSince(
              id,
              items[0],
              live => {
                pages[0] = live;
                publish();
              },
              fail,
            ),
          );
          firstStop?.();
        }
      },
      fail,
    );
    if (trackingTail) firstStop();

    loadMoreRef.current = () => {
      const cursor = pages.at(-1)?.[0];
      if (closed || !cursor || !hasOlder || fetching) return;
      fetching = true;
      setLoadingOlder(true);
      setError('');
      const index = pages.length;
      let stopPage: (() => void) | undefined;
      stopPage = watchMessages(
        id,
        items => {
          if (closed) return;
          pages[index] = items;
          if (index === pages.length - 1) {
            hasOlder = items.length === PAGE_SIZE;
            fetching = false;
            setOlder(hasOlder);
            setLoadingOlder(false);
          }
          publish();
        },
        cause => {
          stopPage?.();
          fetching = false;
          setLoadingOlder(false);
          fail(cause);
        },
        cursor,
      );
      stops.push(stopPage);
    };

    return () => {
      closed = true;
      firstStop?.();
      stops.forEach(stop => stop());
    };
  }, [id, retryKey]);

  const loadMore = useCallback(() => loadMoreRef.current(), []);
  const retry = useCallback(() => setRetryKey(value => value + 1), []);
  return { messages, older, loading, loadingOlder, error, loadMore, retry };
};
