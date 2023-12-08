import { Body, Controller, Post } from '@nestjs/common';
import { Coupon } from 'src/entities/Coupon';
import { CouponService } from './coupon.service';
import { RedeemCouponDto } from './dto/redeemCoupon.dto';

@Controller('')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('/coupon-redeem')
  async couponRedeem(@Body() payload: RedeemCouponDto) {
    return await this.couponService.redeemCoupon(payload);
  }
}
