import { apiClient } from "./api.client";
import { ApiResponse } from "@/types/user.types";
import {
  DiscoveredUser,
  EveryonePage,
  NearbyUser,
  UpdateLocationDTO,
  UserLocation,
} from "@/types/location.types";

export const locationService = {
  async getMyLocation(): Promise<ApiResponse<UserLocation | null>> {
    const res = await apiClient.get<ApiResponse<UserLocation | null>>("/location/me");
    return res.data;
  },

  async updateLocation(
    data: UpdateLocationDTO
  ): Promise<ApiResponse<UserLocation>> {
    const res = await apiClient.put<ApiResponse<UserLocation>>("/location", data);
    return res.data;
  },

  async getNearbyUsers(radius: number = 5): Promise<ApiResponse<NearbyUser[]>> {
    const res = await apiClient.get<ApiResponse<NearbyUser[]>>("/location/nearby", {
      params: { radius },
    });
    return res.data;
  },

  async getEveryone(page: number = 1, limit: number = 24): Promise<ApiResponse<EveryonePage>> {
    const res = await apiClient.get<ApiResponse<EveryonePage>>("/location/everyone", {
      params: { page, limit },
    });
    return res.data;
  },
};
