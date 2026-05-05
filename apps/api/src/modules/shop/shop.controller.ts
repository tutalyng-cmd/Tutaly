import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request as NestRequest,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { SellerGuard } from './guards/seller.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SellerApplicationStatus } from '../support/entities/support.entity';

interface AuthenticatedRequest {
  user: { sub: string; email: string; role: string };
}

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  // ─── Seller Application ────────────────────────────────────────

  @Post('seller/apply')
  @UseGuards(JwtAuthGuard)
  async applySeller(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: ApplySellerDto,
  ) {
    return this.shopService.applySeller(req.user.sub, dto);
  }

  @Get('seller/status')
  @UseGuards(JwtAuthGuard)
  async getSellerStatus(@NestRequest() req: AuthenticatedRequest) {
    return this.shopService.getSellerStatus(req.user.sub);
  }

  @Patch('admin/seller/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminUpdateSeller(
    @Param('id') id: string,
    @Body('status') status: SellerApplicationStatus,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.shopService.adminUpdateSellerApplication(
      id,
      status,
      req.user.sub,
    );
  }

  @Get('admin/seller/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingSellerApps(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shopService.getPendingSellerApplications(
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  // ─── Products ──────────────────────────────────────────────────

  @Post('products')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async createProduct(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ) {
    return this.shopService.createProduct(req.user.sub, dto);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async updateProduct(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.shopService.updateProduct(id, req.user.sub, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async deleteProduct(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.shopService.deleteProduct(id, req.user.sub);
  }

  @Get('products')
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('listingType') listingType?: string,
    @Query('subcategoryId') subcategoryId?: string,
  ) {
    return this.shopService.getProducts(
      parseInt(page || '1', 10),
      parseInt(limit || '12', 10),
      search,
      listingType,
      subcategoryId,
    );
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return { data: await this.shopService.getProductById(id) };
  }

  @Get('seller/products')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getSellerProducts(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shopService.getSellerProducts(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  // ─── Digital File Upload ──────────────────────────────────────

  @Post('products/:id/upload')
  @UseGuards(JwtAuthGuard, SellerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDigitalFile(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.size > 100 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 100MB');
    }
    return this.shopService.uploadDigitalFile(
      id,
      req.user.sub,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  // ─── Cart ─────────────────────────────────────────────────────

  @Get('cart')
  @UseGuards(JwtAuthGuard)
  getCart(@NestRequest() req: AuthenticatedRequest) {
    return { data: this.shopService.getCart(req.user.sub) };
  }

  @Post('cart/add')
  @UseGuards(JwtAuthGuard)
  addToCart(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: AddToCartDto,
  ) {
    return {
      data: this.shopService.addToCart(
        req.user.sub,
        dto.productId,
        dto.quantity,
      ),
    };
  }

  @Delete('cart/:productId')
  @UseGuards(JwtAuthGuard)
  removeFromCart(
    @Param('productId') productId: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return { data: this.shopService.removeFromCart(req.user.sub, productId) };
  }

  // ─── Checkout ─────────────────────────────────────────────────

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @NestRequest() req: AuthenticatedRequest,
    @Body('gateway') gateway?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.shopService.createCheckout(req.user.sub, gateway as any);
  }

  // ─── Payment Webhooks ─────────────────────────────────────────

  @Post('webhook/flutterwave')
  async flutterwaveWebhook(
    @Body() payload: Record<string, any>,
    @Headers('verif-hash') verifHash: string,
  ) {
    return this.shopService.handleFlutterwaveWebhook(payload, verifHash);
  }

  @Post('webhook/paystack')
  async paystackWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.shopService.handlePaystackWebhook(payload, signature);
  }

  // ─── Orders ───────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getBuyerOrders(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shopService.getBuyerOrders(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get('seller/orders')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getSellerOrders(
    @NestRequest() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shopService.getSellerOrders(
      req.user.sub,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  // ─── Delivery & Downloads ─────────────────────────────────────

  @Post('orders/:id/deliver')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async markDelivered(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.shopService.markDelivered(id, req.user.sub);
  }

  @Post('orders/:id/confirm-delivery')
  @UseGuards(JwtAuthGuard)
  async confirmDelivery(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.shopService.confirmDelivery(id, req.user.sub);
  }

  @Post('orders/:id/report')
  @UseGuards(JwtAuthGuard)
  async reportIssue(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
    @Body('reason') reason: string,
  ) {
    return this.shopService.reportIssue(id, req.user.sub, reason);
  }

  @Get('orders/:id/download')
  @UseGuards(JwtAuthGuard)
  async getDownloadUrl(
    @Param('id') id: string,
    @NestRequest() req: AuthenticatedRequest,
  ) {
    return this.shopService.getDownloadUrl(id, req.user.sub);
  }

  // ─── Categories ───────────────────────────────────────────────

  @Get('categories')
  async getCategories() {
    return { data: await this.shopService.getCategories() };
  }
}
