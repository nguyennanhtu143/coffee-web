import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer_section} id="contact">
            {/* Dùng grid classes từ global.css */}
            <div className="grid wide">
                <div className="row">
                    {/* Cột 1: Liên hệ */}
                    <div className="col l-4 m-4 c-12 common-margin">
                        <h6 className={styles.footer_heading}>Liên hệ với chúng tôi</h6>
                        <div className={styles.contact_link}>
                            <a href="#" className={styles.contact_item}>
                                <i className="fa-solid fa-location-dot"></i>
                                <span>Số 34, Ngõ 197 Trần Phú, Hà Đông, Hà Nội</span>
                            </a>
                            <a href="#" className={styles.contact_item}>
                                <i className="fa-solid fa-phone"></i>
                                <span>0837001977</span>
                            </a>
                            <a href="#" className={styles.contact_item}>
                                <i className="fa-solid fa-envelope"></i>
                                <span>nhom1@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: Logo + social */}
                    <div className="col l-4 m-4 c-12 common-margin">
                        <a href="#" className={styles.logo}>The Coffee House</a>
                        <p className={styles.paragraph}>Rất hân hạnh được phục vụ quý khách</p>
                        <div className={styles.social}>
                            {['facebook', 'twitter', 'linkedin', 'instagram', 'pinterest'].map(icon => (
                                <a key={icon} href="#" className={styles.social_link}>
                                    <i className={`fa-brands fa-${icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Cột 3: Giờ mở cửa */}
                    <div className="col l-4 m-4 c-12 common-margin">
                        <h4 className={styles.footer_heading}>Giờ mở cửa</h4>
                        <p className={styles.time_text}>Thứ 2 - Thứ 6: 07:00 - 22:00</p>
                        <p className={styles.time_text}>Thứ 7, Chủ nhật: 08:00 - 21:00</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
