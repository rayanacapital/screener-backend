import debug from 'debug';
import { HttpRequest, WebSocket } from 'uWebSockets.js';
import { getData } from '../data';

export async function ws(ws: WebSocket, _req: HttpRequest) {
  let intervalId: NodeJS.Timeout | undefined = undefined;
  try {
    ws.send(JSON.stringify({ type: 'info', message: 'Connected to screener-backend' }));

    // send data once per second
    intervalId = setInterval(() => {
      if (ws.closed) {
        clearInterval(intervalId);
      } else {
        ws.send(JSON.stringify({ type: 'data', message: getData() }));
      }
    }, 1_000);
  } catch (e: any) {
    clearInterval(intervalId);
    if (!ws.closed) {
      ws.end(1011, e.toString());
    }
    debug(`WebSocket /ws  error: ${e}`);
    console.error('WebSocket /ws error:', e);
  }
}
