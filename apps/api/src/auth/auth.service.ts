import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      {
        secret: this.config.get('JWT_ACCESS_SECRET') ?? 'change-me-access-secret',
        expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
      },
    );
    const refreshToken = randomUUID() + randomUUID();
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An account with that email already exists');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role ?? 'CUSTOMER',
        passwordHash: await bcrypt.hash(dto.password, 12),
      },
    });

    if (user.role === 'SELLER') {
      await this.prisma.sellerProfile.create({
        data: {
          userId: user.id,
          shopName: `${user.name}'s Shop`,
          slug: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(-5)}`,
        },
      });
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.publicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid email or password');
    if (user.isBanned) throw new UnauthorizedException('Account suspended');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.publicUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired, please log in again');
    }
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(session.user.id, session.user.email, session.user.role);
    return { user: this.publicUser(session.user), ...tokens };
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
    return { success: true };
  }

  private publicUser(u: any) {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      credits: u.credits,
      avatarUrl: u.avatarUrl,
    };
  }
}
