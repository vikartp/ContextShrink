// Sample config file containing various secrets and PII
const config = {
  // Will trigger "AWS Access Key" and "AWS Secret Key" (Critical)
  awsAccessKey: "AKIAIOSFODNN7EXAMPLE",
  awsSecret: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  
  // Will trigger "OpenAI API Key" (Critical)
  openAiToken: "sk-proj-ThisIsAFakeOpenAITokenForTestingPurposes",
  
  // Will trigger "Database URL" (Critical)
  databaseUrl: "postgresql://user:secretpassword@localhost:5432/mydb",
  
  // Will trigger "Generic Password" (High)
  apiKey: "super_secret_api_key_123",
  
  // Will trigger "Email Address" (Low)
  adminEmail: "admin@example.com",
  
  // Will trigger "IP Address" (Low)
  serverIp: "192.168.1.100"
};
