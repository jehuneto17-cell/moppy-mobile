import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { C, space } from "@/src/theme";

export function WizardShell({
  step,
  maxStep = 8,
  footerLabel,
  onFooterPress,
  footerDisabled,
  footerLoading,
  footerExtra,
  children,
}: {
  step: number;
  maxStep?: number;
  footerLabel?: string;
  onFooterPress?: () => void;
  footerDisabled?: boolean;
  footerLoading?: boolean;
  footerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.progressWrap}>
        <ProgressBar value={step} max={maxStep} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>

      {footerLabel && onFooterPress && (
        <View style={styles.footer}>
          {footerExtra}
          <Button variant="primary" size="large" disabled={footerDisabled} loading={footerLoading} onPress={onFooterPress} style={{ width: "100%" }}>
            {footerLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  progressWrap: { paddingHorizontal: space.xxl, paddingTop: space.l },
  content: { padding: space.xxl, paddingBottom: 96 },
  footer: {
    padding: space.l,
    paddingHorizontal: space.xxl,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: space.m,
  },
});
