import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      client.user = payload; // Attach user to the socket client
      return true;
    } catch (err) {
      this.logger.warn(`Invalid token: ${(err as Error).message}`);
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: any): string | null {
    // 1. Check handshake headers
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }

    // 2. Check query params (often used in WebSockets)
    const queryToken = client.handshake?.query?.token;
    if (queryToken) {
      return queryToken;
    }

    // 3. Check auth payload (socket.io v4 standard)
    const authToken = client.handshake?.auth?.token;
    if (authToken) {
      return authToken;
    }

    return null;
  }
}
