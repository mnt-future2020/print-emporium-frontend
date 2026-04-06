import { axiosInstance } from "./axios";

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
}

export interface EmailConfigResponse {
  success: boolean;
  emailConfig?: EmailConfig;
  message?: string;
}

export interface TestEmailRequest {
  testEmail: string;
  message?: string;
}

// Get email configuration
export const getEmailConfiguration = async (): Promise<EmailConfigResponse> => {
  const response = await axiosInstance.get("/api/settings/email-configuration");
  return response.data;
};

// Update email configuration
export const updateEmailConfiguration = async (
  config: EmailConfig
): Promise<EmailConfigResponse> => {
  const response = await axiosInstance.put(
    "/api/settings/email-configuration",
    config
  );
  return response.data;
};

// Test email configuration
export const testEmailConfiguration = async (data: TestEmailRequest) => {
  const response = await axiosInstance.post(
    "/api/settings/email-configuration/test",
    data
  );
  return response.data;
};
