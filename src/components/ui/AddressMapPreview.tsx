import Mapbox from "@rnmapbox/maps";
import { StyleSheet, View } from "react-native";

import { C, radius } from "@/src/theme";

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) Mapbox.setAccessToken(token);

// Preview estático (sem gestos) do endereço digitado — usado nas telas de
// cadastro de endereço (C04 e "criar pedido"). Some sozinho se ainda não tem
// coordenada (endereço não geocodificado ainda) ou se falta o token.
export function AddressMapPreview({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  if (!token || lat == null || lng == null) return null;

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false} logoEnabled={false} attributionEnabled={false}>
        <Mapbox.Camera centerCoordinate={[lng, lat]} zoomLevel={15} animationDuration={0} />
        <Mapbox.PointAnnotation id="address-pin" coordinate={[lng, lat]}>
          <View style={styles.pinOuter}>
            <View style={styles.pinInner} />
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 140, borderRadius: radius.l, overflow: "hidden", marginTop: 4 },
  map: { flex: 1 },
  pinOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.purplePrimary + "33", alignItems: "center", justifyContent: "center" },
  pinInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.purplePrimary, borderWidth: 2, borderColor: C.white },
});
