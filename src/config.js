const config = {
  API_URL:
    window.env?.REACT_APP_QA_API_URL || 'https://api.studyroom-qa.alpaon.net',
  DEPARTMENT_ID: window.env?.REACT_APP_DEPARTMENT_ID || 1,
};

export default config;
