import axiosInstance from './axiosInstance';

export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.patch('/profile/me', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
