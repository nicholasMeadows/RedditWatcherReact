export enum NodeRedWebSocketPayloadType {
  DOOR_OPENED_OR_CLOSED = "DOOR_OPENED_OR_CLOSED",
}

export interface NodeRedWebSocketDoorOpenedPayload {
  open: boolean;
}

export default interface NodeRedWebSocketPayload {
  type: NodeRedWebSocketPayloadType;
  payload: NodeRedWebSocketDoorOpenedPayload;
}
