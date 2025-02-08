
import Coupon from '../../DB/Models/coupon.model.js'
import CouponUsers from '../../DB/Models/coupon-users.model.js'
import { DateTime } from 'luxon'

export async function applyCouponValidation(couponCode, userId){

    // couponCodeCheck
    const coupon  = await Coupon.findOne({couponCode})
    if(!coupon) return { message: 'CouponCode is invalid' , status:400}

    // couponStatus Check
    if(
        coupon.couponStatus == 'expired' || 
        DateTime.fromISO(coupon.toDate) < DateTime.now()
    ) return { message: 'this coupon is  expired' , status:400}

    // start date check
    if(
        DateTime.now() < DateTime.fromISO(coupon.fromDate) 
    ) return { message: 'this coupon is not started yet' , status:400}


    // user cases
    const isUserAssgined = await CouponUsers.findOne({couponId:coupon._id , userId})
    if(!isUserAssgined) return { message: 'this coupon is not assgined to you' , status:400}

    // maxUsage Check
    if(isUserAssgined.maxUsage <= isUserAssgined.usageCount)  return { message: 'you have exceed the usage count for this coupon' , status:400}

    return coupon

}
