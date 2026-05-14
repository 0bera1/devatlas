'use client';

import type { CollaborationConnection } from '@/domains/collaboration/collaborationDomains';
import { getApiBaseUrl } from '@/lib/api/base-url';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

const NODE_MOVE_EMIT_MS = 45;

export interface RemoteNodeMovePayload {
  readonly nodeId: string;
  readonly x: number;
  readonly y: number;
  readonly userId: string;
}

function isNodeMovePayload(
  data: unknown,
  diagramId: string,
): data is RemoteNodeMovePayload & { diagramId: string } {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const o = data as Record<string, unknown>;
  return (
    o.diagramId === diagramId &&
    typeof o.nodeId === 'string' &&
    typeof o.x === 'number' &&
    typeof o.y === 'number' &&
    typeof o.userId === 'string' &&
    !Number.isNaN(o.x) &&
    !Number.isNaN(o.y)
  );
}

export function useDiagramRealtime(
  diagramId: string,
  token: string | null,
  enabled: boolean,
  onRemoteNodeMove: (payload: RemoteNodeMovePayload) => void,
): {
  readonly emitNodeMove: (nodeId: string, x: number, y: number) => void;
  readonly peerCount: number;
  readonly connection: CollaborationConnection;
  readonly connectionError: string | null;
  readonly reconnect: () => void;
} {
  const onRemoteRef = useRef<(p: RemoteNodeMovePayload) => void>(
    onRemoteNodeMove,
  );
  onRemoteRef.current = onRemoteNodeMove;

  const [peerCount, setPeerCount] = useState<number>(0);
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
    if (!enabled || token === null || diagramId.length === 0) {
      setConnection('idle');
      setConnectionError(null);
      setPeerCount(0);
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
      socket.emit('join-diagram', { diagramId });
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

    const dropPeer = (): void => {
      setPeerCount((c: number): number => Math.max(0, c - 1));
    };

    const onNodeMove = (data: unknown): void => {
      if (!isNodeMovePayload(data, diagramId)) {
        return;
      }
      onRemoteRef.current({
        nodeId: data.nodeId,
        x: data.x,
        y: data.y,
        userId: data.userId,
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
    socket.on('diagram-room-snapshot', onSnapshot);
    socket.on('diagram-peer-joined', bumpPeer);
    socket.on('diagram-peer-left', dropPeer);
    socket.on('node-move', onNodeMove);

    return () => {
      unmounting = true;
      socket.emit('leave-diagram', { diagramId });
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('diagram-room-snapshot', onSnapshot);
      socket.off('diagram-peer-joined', bumpPeer);
      socket.off('diagram-peer-left', dropPeer);
      socket.off('node-move', onNodeMove);
      socket.disconnect();
      socketRef.current = null;
      setPeerCount(0);
      setConnection('idle');
      setConnectionError(null);
    };
  }, [diagramId, token, enabled]);

  const emitNodeMove = useCallback(
    (nodeId: string, x: number, y: number): void => {
      const socket = socketRef.current;
      if (socket === null || !socket.connected) {
        return;
      }
      const now: number = Date.now();
      if (now - lastEmitRef.current < NODE_MOVE_EMIT_MS) {
        return;
      }
      lastEmitRef.current = now;
      socket.emit('node-move', { diagramId, nodeId, x, y });
    },
    [diagramId],
  );

  return {
    emitNodeMove,
    peerCount,
    connection,
    connectionError,
    reconnect,
  };
}
