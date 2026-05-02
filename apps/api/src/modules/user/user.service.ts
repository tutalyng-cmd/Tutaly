import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SeekerProfile } from './entities/seeker-profile.entity';
import { EmployerProfile } from './entities/employer-profile.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepo: Repository<SeekerProfile>,
    @InjectRepository(EmployerProfile)
    private readonly employerProfileRepo: Repository<EmployerProfile>,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  async getSeekerProfile(userId: string) {
    let profile = await this.seekerProfileRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      // Create an empty profile if none exists yet
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      profile = this.seekerProfileRepo.create({ user });
      await this.seekerProfileRepo.save(profile);
    }

    // Generate signed URL for resume if it exists
    if (profile.resumeUrl) {
      const { data } = await this.supabase.storage
        .from('resumes')
        .createSignedUrl(profile.resumeUrl, 3600); // 1 hour expiry

      // We can temporarily attach the signed URL for the frontend
      Object.assign(profile, { resumeSignedUrl: data?.signedUrl || null });
    }

    if (profile.avatarUrl) {
      const { data } = await this.supabase.storage
        .from('avatars')
        .createSignedUrl(profile.avatarUrl, 3600); // 1 hour expiry

      Object.assign(profile, { avatarSignedUrl: data?.signedUrl || null });
    }

    return profile;
  }

  async updateSeekerProfile(userId: string, dto: Partial<SeekerProfile>) {
    const profile = await this.getSeekerProfile(userId);

    Object.assign(profile, dto);
    await this.seekerProfileRepo.save(profile);

    return profile;
  }

  async uploadResume(userId: string, fileBuffer: Buffer) {
    const profile = await this.getSeekerProfile(userId);

    const { data, error } = await this.supabase.storage
      .from('resumes')
      .upload(`${userId}/cv-${Date.now()}.pdf`, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true, // replaces previous CV if same name, though we use Date.now() for unique
      });

    if (error) {
      throw new BadRequestException(
        `Failed to upload resume: ${error.message}`,
      );
    }

    profile.resumeUrl = data.path;
    await this.seekerProfileRepo.save(profile);

    return {
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: profile.resumeUrl,
    };
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer, mimetype: string) {
    const profile = await this.getSeekerProfile(userId);

    const ext = mimetype.split('/')[1] || 'png';
    const { data, error } = await this.supabase.storage
      .from('avatars')
      .upload(`${userId}/avatar-${Date.now()}.${ext}`, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(
        `Failed to upload avatar: ${error.message}`,
      );
    }

    profile.avatarUrl = data.path;
    await this.seekerProfileRepo.save(profile);

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: profile.avatarUrl,
    };
  }

  // --- Employer Profile ---

  async getEmployerProfile(userId: string) {
    let profile = await this.employerProfileRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      // Create an empty profile if none exists yet
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      profile = this.employerProfileRepo.create({ user, companyName: 'New Company' });
      await this.employerProfileRepo.save(profile);
    }

    // Generate signed URL for logo if it exists
    if (profile.logoUrl) {
      const { data } = await this.supabase.storage
        .from('logos')
        .createSignedUrl(profile.logoUrl, 3600); // 1 hour expiry

      Object.assign(profile, { logoSignedUrl: data?.signedUrl || null });
    }

    return profile;
  }

  async updateEmployerProfile(userId: string, dto: Partial<EmployerProfile>) {
    const profile = await this.getEmployerProfile(userId);

    Object.assign(profile, dto);
    await this.employerProfileRepo.save(profile);

    return profile;
  }

  async uploadLogo(userId: string, fileBuffer: Buffer, mimetype: string) {
    const profile = await this.getEmployerProfile(userId);

    const ext = mimetype.split('/')[1] || 'png';
    const { data, error } = await this.supabase.storage
      .from('logos')
      .upload(`${userId}/logo-${Date.now()}.${ext}`, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(
        `Failed to upload logo: ${error.message}`,
      );
    }

    profile.logoUrl = data.path;
    await this.employerProfileRepo.save(profile);

    return {
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: profile.logoUrl,
    };
  }
}
