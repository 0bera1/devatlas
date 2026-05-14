'use client';

import type { CollaborationConnection } from '@/domains/collaboration/collaborationDomains';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const SELECTION_EMIT_MS = 120;

export interface RemoteDocumentSelection {
  readonly userId: string;
  readonly anchor: number;
  readonly focus: number;
}

function isSelectionPayload(
  data: unknown,
  documentId: string,
): data is RemoteDocumentSelection & { documentId: string } {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const o = data as Record<string, unknown>;
  return (
    o.documentId === documentId &&
    typeof o.userId === 'string' &&
    typeof o.anchor === 'number' &&
    typeof o.focus === 'number'
  );
}

export function useDocumentCollaboration(
  documentId: string,
  token: string | null,
  enabled: boolean,
): {
  readonly peerCount: number;
  readonly remoteSelections: readonly RemoteDocumentSelection[];
  readonly emitSelection: (anchor: number, focus: number) => void;
  readonly connection: CollaborationConnection;
  readonly connectionError: string | null;
  readonly reconnect: () => void;
} {
  const [peerCount, setPeerCount] = useState<number>(0);
  const [remoteSelections, setRemoteSelections] = useState<
    RemoteDocumentSelection[]
  >([]);
  const [connection, setConnection] =
    useState<CollaborationConnection>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const lastEmitRef = useRef<number>(0);
  const socketRef = useRef<Socket | null>(null);

  const reconnect = useCallback((): void => {
    const socket = socketRef.current;
    if (socket === null) {
      return;
    }
    setConnectionError(null);
    setConnection('connecting');
    socket.connect();
  }, []);

  useEffect(() => {
    if (!enabled || token === null || documentId.length === 0) {
      setConnection('idle');
      setConnectionError(null);
      setPeerCount(0);
      setRemoteSelections([]);
      return;
    }

    let unmounting = false;

    setConnection('connecting');
    setConnectionError(null);

    const socket: Socket = io(`${getApiBaseUrl()}/collaboration`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
    });

    socketRef.current = socket;

    const onConnect = (): void => {
      setConnection('connected');
      setConnectionError(null);
      socket.emit('join-document', { documentId });
    };

    const onSnapshot = (payload: unknown): void => {
      if (typeof payload !== 'object' || payload === null) {
        return;
      }
      const c = (payload as { peerCount?: unknown }).peerCount;
      if (typeof c === 'number' && c >= 0) {
        setPeerCount(c);
      }
    };

    const bumpPeer = (): void => {
      setPeerCount((c: number): number => c + 1);
    };

    const dropPeer = (payload?: unknown): void => {
      setPeerCount((c: number): number => Math.max(0, c - 1));
      if (
        typeof payload === 'object' &&
        payload !== null &&
        typeof (payload as { userId?: unknown }).userId === 'string'
      ) {
        const leftUserId: string = (payload as { userId: string }).userId;
        setRemoteSelections((prev: RemoteDocumentSelection[]) =>
          prev.filter(
            (r: RemoteDocumentSelection): boolean => r.userId !== leftUserId,
          ),
        );
      }
    };

    const onSelection = (data: unknown): void => {
      if (!isSelectionPayload(data, documentId)) {
        return;
      }
      setRemoteSelections((prev: RemoteDocumentSelection[]) => {
        const next: RemoteDocumentSelection[] = prev.filter(
          (r: RemoteDocumentSelection): boolean => r.userId !== data.userId,
        );
        next.push({
          userId: data.userId,
          anchor: data.anchor,
          focus: data.focus,
        });
        return next;
      });
    };

    const onConnectError = (err: unknown): void => {
      if (unmounting) {
        return;
      }
      setConnection('error');
      const msg: string =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Connection failed';
      setConnectionError(msg);
    };

    const onDisconnect = (): void => {
      if (unmounting) {
        return;
      }
      setConnection('disconnected');
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('document-room-snapshot', onSnapshot);
    socket.on('document-peer-joined', bumpPeer);
    socket.on('document-peer-left', dropPeer);
    socket.on('document-selection', onSelection);

    return () => {
      unmounting = true;
      socket.emit('leave-document', { documentId });
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('document-room-snapshot', onSnapshot);
      socket.off('document-peer-joined', bumpPeer);
      socket.off('document-peer-left', dropPeer);
      socket.off('document-selection', onSelection);
      socket.disconnect();
      socketRef.current = null;
      setPeerCount(0);
      setRemoteSelections([]);
      setConnection('idle');
      setConnectionError(null);
    };
  }, [documentId, token, enabled]);

  const emitSelection = useCallback(
    (anchor: number, focus: number): void => {
      const socket = socketRef.current;
      if (socket === null || !socket.connected) {
        return;
      }
      const now: number = Date.now();
      if (now - lastEmitRef.current < SELECTION_EMIT_MS) {
        return;
      }
      lastEmitRef.current = now;
      socket.emit('document-selection', {
        documentId,
        anchor,
        focus,
      });
    },
    [documentId],
  );

  return {
    peerCount,
    remoteSelections,
    emitSelection,
    connection,
    connectionError,
    reconnect,
  };
}
