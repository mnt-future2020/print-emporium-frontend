import { axiosInstance } from "./axios";

export interface PostOffice {
  name: string;
  district: string;
}

export interface PincodeLookupResult {
  state: string;
  district: string;
  postOffices: PostOffice[];
}

export async function lookupPincode(
  pincode: string,
  signal?: AbortSignal,
): Promise<PincodeLookupResult | null> {
  if (!/^\d{6}$/.test(pincode)) return null;
  try {
    const res = await axiosInstance.get(`/api/pincode/${pincode}`, { signal });
    if (!res.data?.success) return null;
    return {
      state: res.data.state,
      district: res.data.district,
      postOffices: res.data.postOffices,
    };
  } catch (err: any) {
    if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
      throw err; // let caller know it was cancelled
    }
    return null;
  }
}
