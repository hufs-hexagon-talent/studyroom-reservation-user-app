import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function useUrlQuery(param, defaultValue = '', departmentId) {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryValue = () => {
    const params = new URLSearchParams(location.search);
    return params.get(param) || defaultValue;
  };

  const [value, setValue] = useState(getQueryValue());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentValue = params.get(param) || defaultValue;
    if (currentValue !== value) {
      setValue(currentValue);
    }
  }, [location.search]);

  const updateQuery = newValue => {
    const params = new URLSearchParams(location.search);
    if (newValue) {
      params.set(param, newValue);
    } else {
      params.delete(param);
    }

    // departmentId를 URL 경로에 추가하여 이동
    navigate(`/${departmentId}?${params.toString()}`, { replace: true });
  };

  return [value, updateQuery];
}

export default useUrlQuery;
