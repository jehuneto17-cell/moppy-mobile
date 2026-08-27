// Mock do Cloudinary (mesma interface de shared/mocks/cloudinary.ts — ver nota em asaas.ts).
export async function uploadImage(folder: string) {
  const fakeId = Math.random().toString(36).slice(2, 10);
  return { url: `https://res.cloudinary.com/moppy-mock/image/upload/${folder}/${fakeId}.jpg` };
}
