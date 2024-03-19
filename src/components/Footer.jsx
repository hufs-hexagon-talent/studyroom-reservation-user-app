import React from 'react';

const Footer = () => {
  return (
    <footer className="wrap-footer">
      <div className="box-bottom">
        <div className="wrap-footer-inner">
          <div className="bottom-related">
            <div className="box">
              <button type="button" className="select">
                학부/대학원
                <i className="icon open"></i>
              </button>
              <div className="list_box" style={{ display: 'none' }}>
                <ul>
                  <li></li>
                  <li></li>
                </ul>
              </div>
            </div>
            <div className="box">
              <button type="button" className="select">
                주요산하기관
                <i className="icon open"></i>
              </button>
              <div className="list_box" style={{ display: 'none' }}>
                <ul>
                  <li></li>
                  <li></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bottom-sns">
            <ul>
              <li className="fb">
                <a
                  href="https://www.facebook.com/hufsces"
                  target="_blank"
                  rel="noreferrer">
                  페이스북 바로가기
                </a>
              </li>
              <li className="is">
                <a
                  href="https://www.instagram.com/hufs_cse"
                  target="_blank"
                  rel="noreferrer">
                  인스타그램 바로가기
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="box-footer">
          <div className="footer-logo">
            <img
              src="/sites/computer/masterSkin/computer_JW_MS_K2WT001_M/images/logo_footer.svg"
              alt="한국외국어대학교"
            />
          </div>
          <div className="footer-address">
            <p>
              <span>
                <b>글로벌캠퍼스</b>
                17035 경기도 용인시 처인구 모현읍 외대로 81 한국외국어대학교
                글로벌캠퍼스 (공학관 205호)
              </span>
            </p>
            <p>
              <span>
                <b>TEL.</b>
                031-330-4268
              </span>
              <span>
                <b>Email.</b>
                <a href="mailto:ces@hufs.ac.kr">ces@hufs.ac.kr</a>
              </span>
            </p>
            <p className="copyright">
              Copyright ⓒ Hankuk University of Foreign Studies. All Rights
              Reserved.
            </p>
          </div>
        </div>
      </div>
      <div className="goto-top">
        <a href="#">::before TOP</a>
      </div>
    </footer>
  );
};

export default Footer;
