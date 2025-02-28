const config = {
  API_URL:
    window.env?.REACT_APP_API_URL ||
    'https://api.studyroom.computer.hufs.ac.kr',
  DEPARTMENT_ID: window.env?.REACT_APP_DEPARTMENT_ID || 1,
};

export default config;
