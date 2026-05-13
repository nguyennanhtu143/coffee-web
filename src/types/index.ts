export interface Product {
    id?: number;
    productId: number;
    name: string;
    description?: string;
    image?: string;
    minPrice?: number;
    averageRatting?: number;
    sizes?: ProductSize[];
}

export interface ProductSize {
    id: number;
    productId: number;
    size: string;
    price: number;
    description?: string;
}

export interface CartItem {
    cartId: number;
    productSizeId: number;
    productId: number;
    nameProduct: string;
    size: string;
    price: number;
    quantityOrder: number;
    totalPrice: number;
    imageUrl: string;
}

export interface OrderProduct {
    productSizeId: number;
    productName: string;
    size?: string;
    price: number;
    image?: string;
    quantityOrder: number;
    totalPrice: number;
}

export interface CancelOrderOutput {
    name: string;
    reason: string;
}

export interface Order {
    orderId: number;
    productOrderOutputs: OrderProduct[];
    cancelOrderOutput?: CancelOrderOutput;
    state: string;
    totalPrice: number;
}

export interface Comment {
    id: number;
    userId: number;
    nameUser: string;
    commentId: number;
    size?: string;
    image?: string;
    comment: string;
    rating: number;
    commentImages?: string[];
    createdAt: string;
}

export interface User {
    id?: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    imageUrl?: string;
}

export interface UserAddress {
    addressId: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    toDistrictId: number;
    toWardCode: string;
    isDefault: boolean;
}

export interface Page<T> {
    content: T[];
    number: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export interface ProductPageConfig {
    userPageSize: number;
    adminPageSize: number;
}

export interface Category {
    categoryId: number;
    name: string;
}

export interface Coupon {
    id: number;
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxDiscount?: number;
    minOrderValue: number;
    maxUsage: number;
    currentUsage: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

export interface BankTransferInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    transferContent: string;
    qrUrl: string;
    orderId: number;
}

export interface ApplyCouponResult {
    code: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    freeShip?: boolean;
    maxShippingDiscount?: number;
}

export interface ShippingFeeResult {
    shippingFee: number;
    serviceFee: number;
}

export interface GHNProvince {
    ProvinceID: number;
    ProvinceName: string;
}

export interface GHNDistrict {
    DistrictID: number;
    DistrictName: string;
}

export interface GHNWard {
    WardCode: string;
    WardName: string;
}

export interface StatisticOverview {
    totalRevenue: number;
    totalOrders: number;
    totalCompletedOrders: number;
    totalCanceledOrders: number;
    ordersByState: { state: string; count: number }[];
    topProducts: { productName: string; image?: string; size?: string; totalQuantitySold: number; totalRevenue: number }[];
}

export interface RevenueData {
    period: string;
    totalOrders: number;
    totalRevenue: number;
}
