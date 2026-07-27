import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'fallback',
      clientSecret:
        configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'fallback',
      callbackURL: `${configService.get<string>('API_URL') || 'http://localhost:3001'}/auth/linkedin/callback`,
      scope: ['r_emailaddress', 'r_liteprofile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): any {
    const { id, name, emails, photos } = profile;

    const user = {
      providerId: id,
      provider: 'linkedin',
      email: emails[0].value,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value,
    };

    done(null, user);
  }
}
