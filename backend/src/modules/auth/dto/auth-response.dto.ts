import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from './create-user.dto';

export class UserProfileDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@railway.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Smith',
  })
  fullName: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last profile update timestamp',
    example: '2024-01-20T14:45:00Z',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-01-20T09:15:00Z',
    format: 'date-time',
    nullable: true,
  })
  lastLoginAt?: Date | null;
}

export class AuthTokensDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE1MTYyMzkwMjJ9.4Adst53rAeg6TkjWPbtJJKYb8Zu6z7XN2vl2k6kbQGI',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Authentication tokens',
    type: AuthTokensDto,
  })
  tokens: AuthTokensDto;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto,
  })
  user: UserProfileDto;

  @ApiProperty({
    description: 'Login success message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Newly created user profile',
    type: UserProfileDto,
  })
  user: UserProfileDto;

  @ApiProperty({
    description: 'Registration success message',
    example: 'User registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Whether email verification is required',
    example: true,
  })
  emailVerificationRequired?: boolean;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'New authentication tokens',
    type: AuthTokensDto,
  })
  tokens: AuthTokensDto;

  @ApiProperty({
    description: 'Token refresh success message',
    example: 'Tokens refreshed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;
}

export class PasswordChangeResponseDto {
  @ApiProperty({
    description: 'Password change success message',
    example: 'Password changed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Whether user needs to login again',
    example: false,
  })
  requiresReauth: boolean;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Password reset request message',
    example: 'Password reset email sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Reset token expiration time in minutes',
    example: 15,
  })
  expiresInMinutes: number;
}

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Password reset success message',
    example: 'Password reset successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Whether user should login with new credentials',
    example: true,
  })
  shouldLogin: boolean;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Logged out successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'List of user profiles',
    type: [UserProfileDto],
  })
  data: UserProfileDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Invalid credentials',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/auth/login',
  })
  path: string;

  @ApiPropertyOptional({
    description: 'Validation errors (if applicable)',
    example: ['email must be a valid email', 'password is too short'],
  })
  validationErrors?: string[];
}
