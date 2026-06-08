import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalPage } from '../../support/entities/support.entity';

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** All 12 legal page slugs required by the platform. */
const LEGAL_PAGE_SLUGS = [
  { slug: 'terms-of-service', title: 'Terms of Service' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'disclaimer', title: 'Disclaimer' },
  { slug: 'community-guidelines', title: 'Community Guidelines' },
  { slug: 'review-policy', title: 'Review Policy' },
  { slug: 'marketplace-policy', title: 'Marketplace Policy' },
  { slug: 'refund-policy', title: 'Refund Policy' },
  { slug: 'advertiser-policy', title: 'Advertiser Policy' },
  { slug: 'employer-policy', title: 'Employer Policy' },
  { slug: 'cookie-policy', title: 'Cookie Policy' },
  { slug: 'about-us', title: 'About Us' },
  { slug: 'contact-us', title: 'Contact Us' },
];

@Injectable()
export class LegalPagesService {
  private readonly logger = new Logger(LegalPagesService.name);

  constructor(
    @InjectRepository(LegalPage)
    private readonly legalRepo: Repository<LegalPage>,
  ) {}

  /**
   * Seed all 12 legal pages with placeholder content if they don't exist.
   * Called on module init or manually.
   */
  async seedLegalPages() {
    for (const page of LEGAL_PAGE_SLUGS) {
      const existing = await this.legalRepo.findOne({ where: { slug: page.slug } });
      if (!existing) {
        const newPage = this.legalRepo.create({
          slug: page.slug,
          title: page.title,
          content: `<h1>${page.title}</h1><p>This page is under construction. Content will be added soon.</p>`,
        });
        await this.legalRepo.save(newPage);
        this.logger.log(`Seeded legal page: ${page.slug}`);
      }
    }
  }

  /**
   * GET /admin/legal — list all legal pages with titles and last-updated dates.
   */
  async getAllLegalPages() {
    const pages = await this.legalRepo.find({
      select: ['id', 'slug', 'title', 'updatedAt'],
      order: { title: 'ASC' },
    });
    return { data: toPlain(pages) };
  }

  /**
   * GET /admin/legal/:slug — single page content.
   */
  async getLegalPageBySlug(slug: string) {
    const page = await this.legalRepo.findOne({
      where: { slug },
      relations: ['updatedBy'],
    });
    if (!page) throw new NotFoundException(`Legal page "${slug}" not found`);

    return {
      data: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        updatedAt: page.updatedAt,
        updatedByEmail: page.updatedBy?.email || null,
      },
    };
  }

  /**
   * PUT /admin/legal/:slug — update content via rich text editor.
   */
  async updateLegalPage(slug: string, content: string, title: string | undefined, adminId: string) {
    const page = await this.legalRepo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException(`Legal page "${slug}" not found`);

    page.content = content;
    if (title) page.title = title;
    page.updatedBy = { id: adminId } as any;

    await this.legalRepo.save(page);
    this.logger.log(`Legal page "${slug}" updated by admin ${adminId}`);

    return { success: true, message: `Legal page "${slug}" updated` };
  }
}
