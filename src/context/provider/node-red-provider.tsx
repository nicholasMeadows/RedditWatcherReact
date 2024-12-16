import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AppConfigStateContext } from "../app-config-context.ts";
import { useNavigate } from "react-router-dom";
import { NOT_FOUND_404 } from "../../RedditWatcherConstants.ts";
import NodeRedWebSocketPayload from "../../model/NodeRedWebSocketPayload.ts";

type Props = {
  children: ReactNode;
};
const NodeRedProvider: FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const { nodeRedUrl } = useContext(AppConfigStateContext);

  const nodeRedWebSocketRef = useRef<WebSocket | undefined>();

  const onWebsocketError = useCallback((event: Event) => {
    console.log(`Error connecting to websocket`, event);
  }, []);

  const onWebsocketMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data;
      const message = JSON.parse(data) as NodeRedWebSocketPayload;
      if (message.payload.open && !window.location.href.endsWith(NOT_FOUND_404)) {
        navigate(NOT_FOUND_404, { replace: false });
      }
    },
    [navigate]
  );

  const closeExistingWebSocket = useCallback(() => {
    const webSocket = nodeRedWebSocketRef.current;
    if (webSocket !== undefined) {
      webSocket.close();
      nodeRedWebSocketRef.current = undefined;
    }
  }, []);

  const openNodeRedWebSocket = useCallback(() => {
    if (nodeRedUrl === undefined) {
      return;
    }
    let webSocketUrl = "ws://";
    if (nodeRedUrl.startsWith("https")) {
      webSocketUrl += nodeRedUrl.replace("https://", "");
    } else {
      webSocketUrl += nodeRedUrl.replace("http://", "");
    }
    webSocketUrl += "/reddit-watcher";
    const webSocket = new WebSocket(webSocketUrl);
    nodeRedWebSocketRef.current = webSocket;
    webSocket.addEventListener("error", onWebsocketError);
    webSocket.addEventListener("message", onWebsocketMessage);
  }, [nodeRedUrl, onWebsocketError, onWebsocketMessage]);

  useEffect(() => {
    closeExistingWebSocket();
    openNodeRedWebSocket();
    return () => {
      closeExistingWebSocket();
    };
  }, [closeExistingWebSocket, nodeRedUrl, openNodeRedWebSocket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nodeRedWebsocket = nodeRedWebSocketRef.current;
      if (
        nodeRedWebsocket === undefined ||
        nodeRedWebsocket.readyState === WebSocket.CLOSED
      ) {
        console.log("Nicholas Test");
        openNodeRedWebSocket();
      }
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [openNodeRedWebSocket]);

  return <>{children}</>;
};
export default NodeRedProvider;
