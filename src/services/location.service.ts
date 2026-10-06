import { apiClient } from "./api.client";
import { ApiResponse } from "@/types/user.types";
import { NearbyUser, UpdateLocationDTO, UserLocation } from "@/types/location.types";

export const locationService = {
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
};
