const PINATA_JWT = process.env.NEXT_PUBLIC_JWT_SECRET_TOKEN;

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export const uploadToPinata = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error(
      "Pinata JWT token not configured. Please set NEXT_PUBLIC_JWT_SECRET_TOKEN in your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  // Optional: Add metadata
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  // Optional: Add options
  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error("Pinata API Error Response:", errorData);

        // Pinata error responses can have different structures
        if (errorData.error) {
          if (typeof errorData.error === "string") {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details) {
            errorMessage = errorData.error.details;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error("Failed to parse Pinata error response:", parseError);
        // Keep the default HTTP error message
      }

      throw new Error(`Pinata upload failed: ${errorMessage}`);
    }

    const data: PinataUploadResponse = await response.json();
    console.log("Pinata upload successful:", data);
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during Pinata upload");
  }
};

export const uploadJSONToPinata = async (jsonData: any): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error(
      "Pinata JWT token not configured. Please set NEXT_PUBLIC_JWT_SECRET_TOKEN in your environment variables."
    );
  }

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: jsonData,
          pinataMetadata: {
            name: "winsome-chat-data",
            keyvalues: {
              uploadedAt: new Date().toISOString(),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.error("Pinata JSON API Error Response:", errorData);

        if (errorData.error) {
          if (typeof errorData.error === "string") {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details) {
            errorMessage = errorData.error.details;
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.error(
          "Failed to parse Pinata JSON error response:",
          parseError
        );
      }

      throw new Error(`Pinata JSON upload failed: ${errorMessage}`);
    }

    const data: PinataUploadResponse = await response.json();
    console.log("Pinata JSON upload successful:", data);
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during Pinata JSON upload");
  }
};

export const getPinataUrl = (ipfsHash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};
