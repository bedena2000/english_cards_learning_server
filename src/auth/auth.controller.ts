import {
  Body,
  Post,
  Controller,
  Res,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/register.dto';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
      path: '/',
    } as const;
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const base = this.getCookieOptions();

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const base = this.getCookieOptions();

    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
  }

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      body.email,
      body.username,
      body.password,
    );

    this.setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );

    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);

    this.setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );

    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.refresh(refreshToken);

    this.setAuthCookies(
      res,
      result.tokens.accessToken,
      result.tokens.refreshToken,
    );

    return { user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { message: 'Logged out' };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = this.authService.validateAcessToken(accessToken);

    return {
      user,
    };
  }
}
