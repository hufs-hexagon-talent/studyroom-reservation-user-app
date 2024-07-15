import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdminData } from '../../api/user.api';
import { useSnackbar } from 'react-simple-snackbar';
import useAuth from '../../hooks/useAuth';
import './Footer.css';

const Footer = () => {
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
  const { data: checkIsAdmin } = useIsAdminData();

  const handleAdminClick = () => {
    if (loggedIn && checkIsAdmin === true) {
      navigate('/selectRoom');
    } else {
      openSnackbar('관리자 외에는 접근 권한이 없습니다.');
      setTimeout(() => {
        closeSnackbar();
      }, 3000);
    }
  };

  return (
    <div className="w-full">
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
            <p className="block my-2 mx-0 leading-2">
              <span>
                <b className="font-bormal text-footertextbrown">
                  학부 홈페이지.{' '}
                </b>
                <a
                  className="inline hover:underline"
                  href="https://computer.hufs.ac.kr">
                  https://computer.hufs.ac.kr
                </a>
              </span>
            </p>
            <div
              onClick={handleAdminClick}
              className="inline hover:underline cursor-pointer text-gray-400 text-sm mt-3">
              관리자
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
