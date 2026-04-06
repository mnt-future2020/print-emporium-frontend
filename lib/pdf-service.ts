import { axiosInstance } from "./axios";

/**
 * Trigger a browser download from a Blob
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Download Order Slip PDF
 */
export const downloadOrderSlip = async (
  orderId: string,
  size: string = "A4",
) => {
  try {
    const response = await axiosInstance.get(`/api/pdf/order-slip/${orderId}`, {
      params: { size },
      responseType: "blob", // Important for handling PDF binary
    });

    // Extract filename from headers if possible, or generate one
    const filename = `OrderSlip-${orderId}-${size}.pdf`;
    triggerDownload(new Blob([response.data]), filename);
    return { success: true };
  } catch (error) {
    console.error("Failed to download order slip:", error);
    return { success: false, error };
  }
};

/**
 * Download Shipping Label PDF
 */
export const downloadShippingLabel = async (
  orderId: string,
  payload: { awb: string; courier: string; size: string },
) => {
  try {
    const response = await axiosInstance.post(
      `/api/pdf/shipping-label/${orderId}`,
      payload,
      {
        responseType: "blob", // Important for handling PDF binary
      },
    );

    const filename = `ShippingLabel-${payload.awb}.pdf`;
    triggerDownload(new Blob([response.data]), filename);
    return { success: true };
  } catch (error) {
    console.error("Failed to download shipping label:", error);
    return { success: false, error };
  }
};
