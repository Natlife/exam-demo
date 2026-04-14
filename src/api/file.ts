export const create = async (formData: FormData) => {
  const file = formData.get("file") as File;
  if (!file) return { statusCode: 400, message: "No file provided" };

  return new Promise<{ statusCode: number; data?: { url: string } }>((resolve) => {
    // If it's an image, compress it before saving
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve({
            statusCode: 200,
            data: { url: compressedBase64 },
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, keep existing Base64 conversion
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          statusCode: 200,
          data: { url: e.target?.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  });
};
