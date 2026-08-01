import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectService } from './connect.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map of userId -> Set of Socket IDs
  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly connectService: ConnectService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.addUserSocket(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.removeUserSocket(userId, client.id);
    }
  }

  private addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string) {
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socketId);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: any, // any to access user from WsJwtGuard
    @MessageBody() payload: { receiverId: string; content: string }
  ) {
    const senderId = client.user.sub; // ConnectController uses req.user.sub for userId
    const { receiverId, content } = payload;

    // Save to DB
    const result = await this.connectService.sendMessage(senderId, receiverId, content);

    if (result.success) {
      // Emit to receiver if online
      const receiverSockets = this.userSockets.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach(socketId => {
          this.server.to(socketId).emit('newMessage', result.data);
        });
      }

      // Also emit back to sender (to other devices they might have open)
      const senderSockets = this.userSockets.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(socketId => {
          if (socketId !== client.id) {
            this.server.to(socketId).emit('newMessage', result.data);
          }
        });
      }
    }

    return result;
  }
}
