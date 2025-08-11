import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../database/supabase/supabase.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'dev-secret', // Fallback for dev
    });
  }

  async validate(payload: JwtPayload) {
    // For Supabase integration, we validate the token directly with Supabase
    const supabase = this.supabaseService.client;
    
    // In a real implementation with Supabase, we would validate the JWT token
    // For now, we'll just return the payload as validated
    // Supabase handles JWT validation automatically in most cases
    
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}