export class CustomUploadAdapter {
    loader: any;
    uploadFn: (formData: FormData) => Promise<{ imageUrl: string }>;
  
    constructor(loader: any, uploadFn: (formData: FormData) => Promise<{ imageUrl: string }>) {
      this.loader = loader;
      this.uploadFn = uploadFn;
    }
  
    async upload() {
      const file = await this.loader.file;
      const formData = new FormData();
      formData.append("image", file, file.name);
  
      try {
        const { imageUrl } = await this.uploadFn(formData);
        return {
          default: imageUrl,
        };
      } catch (error) {
        throw error;
      }
    }
  }
  