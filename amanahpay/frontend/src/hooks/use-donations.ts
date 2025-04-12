import { useLazyApi, useApi } from './use-api';
import { 
  createDonation, 
  getUserDonations, 
  getCampaignDonations,
  getCurrentUserDonations,
  DonationCreate,
  Donation
} from '../lib/api/donations';
import { useAuth } from './use-auth';

export const useCreateDonation = () => {
  const { user } = useAuth();
  const { execute, isLoading, error } = useLazyApi(createDonation);

  const donate = async (campaignId: number, amount: string, fiatAmount?: number, fiatCurrency?: string) => {
    if (!user) {
      throw new Error('User must be logged in to donate');
    }

    const donationData: DonationCreate = {
      userId: user.id,
      campaignId,
      amount,
      fiatAmount,
      fiatCurrency
    };

    return execute(donationData);
  };

  return {
    donate,
    isLoading,
    error
  };
};

export const useUserDonations = (userId?: number) => {
  const { user } = useAuth();
  const finalUserId = userId || (user?.id ?? 0);
  
  return useApi(
    getUserDonations, 
    { 
      deps: [finalUserId],
      manual: !finalUserId
    }, 
    finalUserId
  );
};

export const useCampaignDonations = (campaignId: number) => {
  return useApi(
    getCampaignDonations, 
    { deps: [campaignId] }, 
    campaignId
  );
};

export const useCurrentUserDonations = () => {
  const { user } = useAuth();
  return useApi(
    getCurrentUserDonations, 
    { 
      deps: [user?.id],
      manual: !user
    }
  );
}; 