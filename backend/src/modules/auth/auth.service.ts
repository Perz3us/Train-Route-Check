import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UserProfileDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
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

    // Create user profile in the database using Prisma
    try {
      const profileData = await this.prisma.profile.create({
        data: {
          id: data.user.id,
          email: createUserDto.email,
          fullName: createUserDto.fullName,
          role: createUserDto.role || 'viewer',
          avatarUrl: createUserDto.avatarUrl,
        },
      });

      return {
        user: {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName || '',
          role: profileData.role as any,
          avatarUrl: profileData.avatarUrl,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          isActive: true,
          lastLoginAt: null,
        },
      };
    } catch (profileError: any) {
      // If profile creation fails, we should delete the auth user too
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new BadRequestException(profileError.message);
    }
  }

  async login(loginDto: LoginDto): Promise<{ tokens: any; user: UserProfileDto }> {
    try {
      const supabase = this.supabase.client;
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        console.error('Supabase Auth Error:', error);
        throw new UnauthorizedException('Invalid credentials: ' + error.message);
      }

      if (!data.user) {
        console.error('No user data returned');
        throw new UnauthorizedException('Invalid credentials');
      }

      // Get user profile using Prisma
      const profileData = await this.prisma.profile.findUnique({
        where: { id: data.user.id },
      });

      if (!profileData) {
        console.error('Profile Fetch Error: Profile not found for user', data.user.id);
        throw new NotFoundException('User profile not found');
      }

      // Update last login time (optional, if you have a field for it, otherwise just updatedAt)
      // Prisma automatically updates updatedAt
      await this.prisma.profile.update({
        where: { id: data.user.id },
        data: { updatedAt: new Date() }, // Force update to trigger updatedAt
      });

      // Generate our own JWT tokens instead of using Supabase tokens
      const payload = { 
        sub: data.user.id, 
        email: data.user.email,
        role: profileData.role
      };
      
      const accessToken = this.jwtService.sign(payload);
      
      // For refresh token, we'll use a simple approach for now
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
          fullName: profileData.fullName || '',
          role: profileData.role as any,
          avatarUrl: profileData.avatarUrl,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          isActive: true,
          lastLoginAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Login Exception:', error);
      throw error;
    }
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    // Get user profile using Prisma
    const data = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.fullName || '',
      role: data.role as any,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
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