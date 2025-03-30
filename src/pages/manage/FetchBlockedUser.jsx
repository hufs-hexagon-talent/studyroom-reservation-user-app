import React, { useEffect, useState } from 'react';
import { Table } from 'flowbite-react';
import { Pagination } from '@mui/material';

import FetchBlocked from '../../components/blocked/FetchBlocked';
import { useBlockedUser, useUnblocked } from '../../api/user.api';

const FetchBlockedUser = () => {
  return (
    <div>
      <div className="mt-10 text-2xl text-center py-10">블락된 사용자 조회</div>
      <FetchBlocked />
    </div>
  );
};

export default FetchBlockedUser;
