import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: UserProfileDto }> {
    const supabase = this.supabase.client;
    
    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new BadRequestException('Failed to create user');
    }

    // Create user profile in the database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: createUserDto.email,
        full_name: createUserDto.fullName,
        role: createUserDto.role || 'viewer',
        avatar_url: createUserDto.avatarUrl,
      })
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, we should delete the auth user too
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new BadRequestException(profileError.message);
    }

    return {
      user: {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name || '',
        role: profileData.role as any,
        avatarUrl: profileData.avatar_url,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
        isActive: true,
        lastLoginAt: null,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ tokens: any; user: UserProfileDto }> {
    const supabase = this.supabase.client;
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new NotFoundException('User profile not found');
    }

    // Update last login time
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', data.user.id);

    // Generate our own JWT tokens instead of using Supabase tokens
    const payload = { 
      sub: data.user.id, 
      email: data.user.email,
      role: profileData.role
    };
    
    const accessToken = this.jwtService.sign(payload);
    
    // For refresh token, we'll use a simple approach for now
    // In a production environment, you might want to store refresh tokens in a database
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    const tokens = {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      tokenType: 'Bearer',
    };

    return {
      tokens,
      user: {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name || '',
        role: profileData.role as any,
        avatarUrl: profileData.avatar_url,
        createdAt: new Date(profileData.created_at),
        updatedAt: new Date(profileData.updated_at),
        isActive: true,
        lastLoginAt: new Date(),
      },
    };
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    // In a more secure implementation, you might want to invalidate the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const supabase = this.supabase.client;
    
    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new NotFoundException('User not found');
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || '',
      role: data.role as any,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: true,
      lastLoginAt: null,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ tokens: any }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Generate new access token
      const newPayload = { 
        sub: payload.sub, 
        email: payload.email,
        role: payload.role
      };
      
      const accessToken = this.jwtService.sign(newPayload);
      
      // Generate new refresh token
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '30d',
      });

      const tokens = {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        tokenType: 'Bearer',
      };

      return { tokens };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}