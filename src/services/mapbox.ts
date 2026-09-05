export type Address = { street: string; number: string; complement?: string; neighborhood: string; city: string; state: string; postal_code: string };

// Geocoding via Mapbox (não usa mais o geocoder nativo do Android/Google Play services).
// Melhor-esforço: se falhar (endereço não encontrado, sem token, offline), o endereço
// é salvo sem lat/lng e a tela segue funcionando sem o pin/distância.
export async function geocodeAddress(address: Address) {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (!token) return {};

  try {
    const query = `${address.street} ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.postal_code}`;
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&country=br&limit=1&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return {};

    const data = await res.json();
    const [lng, lat] = data.features?.[0]?.geometry?.coordinates ?? [];
    if (lat == null || lng == null) return {};
    return { lat, lng };
  } catch {
    return {};
  }
}
