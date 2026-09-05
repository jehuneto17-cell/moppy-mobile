import { auth } from "./firebase";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_CLOUDINARY === "true";

// Upload real: manda o arquivo local pro backend (admin), que tem a API Secret
// do Cloudinary e sobe pra pasta Moppy/<folder>. Documentos de KYC (pasta
// "kyc/...") saem como "authenticated" (URL assinada) — decidido no backend,
// não aqui, pra não depender do app mandar a flag certa.
//
// `localUri` é o file:// de uma foto real (câmera/galeria). As telas de
// captura ainda não têm um seletor de imagem real — enquanto isso não for
// adicionado, chamar isso com EXPO_PUBLIC_USE_MOCK_CLOUDINARY=false e sem
// localUri lança erro (propositalmente, pra não fingir sucesso).
export async function uploadImage(folder: string, localUri?: string) {
  if (USE_MOCK) {
    const fakeId = Math.random().toString(36).slice(2, 10);
    return {
      url: `https://res.cloudinary.com/moppy-mock/image/upload/${folder}/${fakeId}.jpg`,
      publicId: `${folder}/${fakeId}`,
    };
  }

  if (!localUri) {
    throw new Error(`uploadImage("${folder}") chamado sem localUri e sem mock — falta wire de câmera/galeria nessa tela`);
  }

  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Usuário não autenticado");

  const form = new FormData();
  form.append("file", { uri: localUri, name: "upload.jpg", type: "image/jpeg" } as unknown as Blob);
  form.append("folder", folder);

  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/media/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Falha no upload");
  return { url: data.url as string, publicId: data.publicId as string };
}
