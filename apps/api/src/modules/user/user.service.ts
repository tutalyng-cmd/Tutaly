import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SeekerProfile } from './entities/seeker-profile.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SeekerProfile)
    private readonly seekerProfileRepo: Repository<SeekerProfile>,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
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

    return profile;
  }

  async updateSeekerProfile(userId: string, dto: any) {
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
        upsert: true  // replaces previous CV if same name, though we use Date.now() for unique
      });

    if (error) {
      throw new BadRequestException(`Failed to upload resume: ${error.message}`);
    }

    profile.resumeUrl = data.path;
    await this.seekerProfileRepo.save(profile);

    return { 
      success: true, 
      message: 'Resume uploaded successfully',
      resumeUrl: profile.resumeUrl 
    };
  }
}
