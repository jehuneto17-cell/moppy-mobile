// Mock do Cloudinary — mesma interface do SDK real.
// Troca para upload real na Etapa 9 (Bloco 9.2), sem mudar quem chama essa função.

export async function uploadImage(localUri: string, folder: string) {
  const fakeId = Math.random().toString(36).slice(2, 10);
  return {
    url: `https://res.cloudinary.com/moppy-mock/image/upload/${folder}/${fakeId}.jpg`,
    publicId: `${folder}/${fakeId}`,
  };
}
