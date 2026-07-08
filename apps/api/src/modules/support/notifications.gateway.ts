import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  
  // Map userId -> socketId
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token = authHeader?.split(' ')[1] || (client.handshake.query.token as string);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });

      if (payload && payload.sub) {
        this.connectedUsers.set(payload.sub, client.id);
        
        // Attach user to client object
        client.data.user = payload;
        
        // Join a personal room for this user
        client.join(`user_${payload.sub}`);
        
        this.logger.debug(`User ${payload.sub} connected (Socket: ${client.id})`);
      } else {
        throw new WsException('Invalid token payload');
      }
    } catch (error) {
      this.logger.warn(`Connection rejected: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.user?.sub) {
      this.connectedUsers.delete(client.data.user.sub);
      this.logger.debug(`User ${client.data.user.sub} disconnected`);
    }
  }

  /**
   * Pushes a real-time notification to the connected user.
   */
  sendNotification(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }
}
