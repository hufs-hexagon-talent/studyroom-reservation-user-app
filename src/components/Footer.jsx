import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-footermainbg text-footertextcolor">
      <div className="wrap-footer flex flex-col">
        <div className="box-bottom flex justify-between items-center">
          <div className="wrap-footer-inner flex">
            <div className="bottom-related flex items-center">
              <div className="box mr-4">
                <button type="button" className="select">
                  학부/대학원
                  <i className="icon open"></i>
                </button>
                <div className="list_box" style={{ display: 'none' }}>
                  <ul>
                    <li>학부1</li>
                    <li>학부2</li>
                  </ul>
                </div>
              </div>
              <div className="box mr-4">
                <button type="button" className="select">
                  주요산하기관
                  <i className="icon open"></i>
                </button>
                <div className="list_box" style={{ display: 'none' }}>
                  <ul>
                    <li>산하기관1</li>
                    <li>산하기관2</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bottom-sns flex items-center">
              <div className="box mr-4">
                <a
                  href="https://www.facebook.com/hufsces"
                  target="_blank"
                  rel="noreferrer">
                  <img
                    src="/path/to/facebook-image.jpg"
                    alt="Facebook"
                    className="w-8 h-8"
                  />
                </a>
              </div>
              <div className="box">
                <a
                  href="https://www.instagram.com/hufs_cse"
                  target="_blank"
                  rel="noreferrer">
                  <img
                    src="/path/to/instagram-image.jpg"
                    alt="Instagram"
                    className="w-8 h-8"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="box-footer flex flex-col">
          <div className="footer-logo mb-4">
            <img
              src="/sites/computer/masterSkin/computer_JW_MS_K2WT001_M/images/logo_footer.svg"
              alt="한국외국어대학교"
            />
          </div>
          <div className="footer-address mb-4">
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
          </div>
          <p className="copyright">
            Copyright ⓒ Hankuk University of Foreign Studies. All Rights
            Reserved.
          </p>
        </div>
      </div>
      <div className="goto-top">
        <a href="#">::before TOP</a>
      </div>
    </footer>
  );
};

export default Footer;
