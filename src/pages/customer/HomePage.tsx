import React from 'react';
import Navbar from '../../components/layout/Navbar';
import ProductList from '../../components/product/ProductList';
import s from './HomePage.module.css';

export default function HomePage() {
    return (
        <>
            {/* HEADER: Banner + Navbar overlay */}
            <div className={s.header} id="main">
                <div className={s.header_img}>
                    <img src="/assets/img/slider_1.webp" alt="" />
                </div>
                <Navbar />
            </div>

            {/* GIỚI THIỆU */}
            <section className={s.sub_header} id="introduce">
                <div className="grid wide">
                    <div className="row">
                        <div className="col l-5 m-5 c-12">
                            <div className={s.module_left}>
                                <h2 className={s.large_title}>Chúng tôi là</h2>
                                <span className={s.mini_title}>Coffee house</span>
                                <div className={s.day_time}>
                                    Thứ hai đến Thứ bảy <b>8:30am - 11:00pm</b> | Hotline: <a href="tel:0837001977">0837001977</a>
                                </div>
                                <p className={s.description_text}>
                                    Chúng tôi đi khắp thế giới để tìm kiếm cà phê tuyệt vời. Trong quá trình đó, chúng tôi
                                    phát hiện ra những hạt đậu đặc biệt và hiếm đến nỗi chúng tôi có thể chờ đợi để mang chúng về.
                                </p>
                            </div>
                        </div>
                        <div className="col l-7 m-7 c-12">
                            <div className={s.module_right}>
                                <img src="/assets/img/bg_about.webp" alt="Coffee House" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SẢN PHẨM */}
            <section className={s.section_products} id="product">
                <div className={s.section_heading}>
                    <h2 className={s.large_title}>Chúng tôi là</h2>
                    <span className={s.mini_title}>Coffee house</span>
                </div>
                <div style={{ padding: '0 20px' }}>
                    <ProductList apiUrl="/product/get-products" />
                </div>
            </section>

            {/* GIỜ MỞ CỬA */}
            <section className={s.section_hours} id="serve">
                <div className="grid wide">
                    <div className="row">
                        <div className="col l-5 m-5 c-12">
                            <div style={{ textAlign: 'center' }}>
                                <div className={s.hd1}>
                                    <h2>Giờ mở cửa</h2>
                                </div>
                                <div className={s.content_hour}>
                                    <p>Thứ 2 - Thứ 6 hàng tuần</p>
                                    <span>7am - 11am</span><br />
                                    <span>11am - 10pm</span>
                                    <p>Thứ 7, Chủ nhật hàng tuần</p>
                                    <span>8am - 1 am</span><br />
                                    <span>11am - 9pm</span>
                                </div>
                                <div className={s.hotline_hour}>
                                    <div className={s.sdt}>Số điện thoại</div>
                                    <a href="tel:0837001977">0837001977</a>
                                </div>
                            </div>
                        </div>
                        <div className="col l-7 m-7 c-12">
                            <div className={s.size_img}>
                                <img src="//bizweb.dktcdn.net/100/346/521/themes/894784/assets/banner-hours-book.png?1664353170155" alt="Coffee House" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
