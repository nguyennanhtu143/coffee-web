# FE Integration: Admin Search Filter Sort

## Admin Products

```http
GET /api/v1/product/admin-products
Authorization: Bearer <admin_token>
```

Query params:

- `search`: product name keyword.
- `categoryId`: category id.
- `sortBy`: `createdAt`, `name`, `price`.
- `direction`: `asc`, `desc`.
- `page`, `size`.

Examples:

```http
GET /api/v1/product/admin-products?search=latte&page=0&size=20
GET /api/v1/product/admin-products?categoryId=2&sortBy=price&direction=asc&page=0&size=20
GET /api/v1/product/admin-products?sortBy=name&direction=desc&page=0&size=20
```

Response is `Page<ProductOutput>`.
```
public class ProductOutput {
    private Long id;
    private Long productId;
    private String name;
    private String description;
    private String image;
    private Integer minPrice;
    private Double averageRatting;
    private List<ProductSizeOutput> sizes;
}
```

```
public class ProductSizeOutput {
    private Long id;
    private Long productId;
    private String size;
    private Integer price;
    private String description;
}
```

## Admin Orders

Existing endpoint is extended:

```http
GET /api/v1/shop-order/get-orders
Authorization: Bearer <admin_token>
```

Query params:

- `state`: optional order state.
- `orderId`: optional exact order id.
- `phoneNumber`: optional contains search.
- `createdFrom`: optional ISO datetime, e.g. `2026-05-11T00:00:00`.
- `createdTo`: optional ISO datetime.
- `page`, `size`.

Examples:

```http
GET /api/v1/shop-order/get-orders?state=CONFIRMED&page=0&size=20
GET /api/v1/shop-order/get-orders?orderId=123&page=0&size=20
GET /api/v1/shop-order/get-orders?phoneNumber=090&page=0&size=20
GET /api/v1/shop-order/get-orders?createdFrom=2026-05-01T00:00:00&createdTo=2026-05-11T23:59:59&page=0&size=20
```

Response is `Page<ProductOrdersOutput>`.

```
public class ProductOrdersOutput {
    private Long orderId;
    private List<ProductOrderOutput> productOrderOutputs;
    private CancelOrderOutput cancelOrderOutput;
    private String state;
    private Integer totalPrice;
}
```

```
public class ProductOrderOutput {
    private Long productSizeId;
    private String productName;
    private String size;
    private Integer price;
    private String image;
    private Integer quantityOrder;
    private Integer totalPrice;
}
```

```
public class CancelOrderOutput {
    private String name;
    private String reason;
}
```
