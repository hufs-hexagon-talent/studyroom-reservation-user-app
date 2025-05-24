import { useSnackbar } from 'react-simple-snackbar';

export const useCustomSnackbars = () => {
  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50',
    },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  return { openSuccessSnackbar, openErrorSnackbar };
};
