import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate('/selectRoom');
  };

  return (
    <div className="bottom-0 absolute w-full">
      <footer
        id="footer"
        className="bg-footermainbg relative p-0 block break-keep">
        <div className="py-6 px-2.7 ml-5 mr-5">
          <div className="footer-logo">
            <img
              className="w-50 h-10"
              src="https://computer.hufs.ac.kr/sites/computer/masterSkin/computer_JW_MS_K2WT001_M/images/logo_footer.svg"
              alt="한국외국어대학교"
            />
          </div>
          <div className="mt-5 leading-8 text-footertextcolor">
            <p className="block mx-0 leading-2">
              <span className="inline-block text-base font-normal">
                <b className="font-bormal text-footertextbrown">
                  글로벌캠퍼스{' '}
                </b>
                17035 경기도 용인시 처인구 모현읍 외대로 81 한국외국어대학교
                글로벌캠퍼스 (공학관 205호)
              </span>
            </p>
            <p className="block my-2 mx-0 leading-2">
              <span className="inline-block text-base font-normal">
                <b className="font-bormal text-footertextbrown">TEL. </b>
                031-330-4268
              </span>
              <span>
                <b className="font-bormal text-footertextbrown"> Email. </b>
                <a href="mailto:ces@hufs.ac.kr">ces@hufs.ac.kr</a>
              </span>
            </p>
            <p className="text-sm font-light block mx-0">
              Copyright ⓒ Hankuk University of Foreign Studies. All Rights
              Reserved.
            </p>
            <div
              onClick={handleAdminClick}
              style={{
                cursor: 'pointer',
                color: 'white',
                textDecoration: 'underline',
              }}>
              관리자 페이지
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
