import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Icon } from "@/src/components/ui/Icon";
import { LabeledInput } from "@/src/components/ui/LabeledInput";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { uploadImage } from "@/src/services/cloudinary";
import { useCleanerOnboardingStore } from "@/src/store/cleanerOnboardingStore";
import { C, font, radius, space } from "@/src/theme";

type DocKey = "id_document" | "cpf_document" | "selfie" | "address_proof";

const STEPS: { key: DocKey; title: string; instruction: string; needsCpfField?: boolean; allowPdf?: boolean }[] = [
  { key: "id_document", title: "Frente do documento", instruction: "Envie uma foto da frente do seu RG ou CNH, bem legível." },
  { key: "cpf_document", title: "Verso do documento", instruction: "Informe seu CPF e envie uma foto do verso do RG ou CNH.", needsCpfField: true },
  { key: "selfie", title: "Selfie", instruction: "Tire uma selfie com rosto limpo, bem iluminado, sem óculos escuros ou boné." },
  {
    key: "address_proof",
    title: "Comprovante de endereço",
    instruction: "Envie um comprovante com menos de 90 dias (conta de luz, água, etc). Foto ou PDF.",
    allowPdf: true,
  },
];

export default function DocumentosScreen() {
  const router = useRouter();
  const { documents, cpfNumber, setDocument, setCpfNumber } = useCleanerOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const captured = !!documents[step.key];

  async function handleCapture() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setShowError(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      cameraType: step.key === "selfie" ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    });
    if (result.canceled) return;

    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadImage(`kyc/${step.key}`, result.assets[0].uri);
      setDocument(step.key, url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha ao enviar a foto. Tente de novo.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePickPdf() {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
    if (result.canceled) return;

    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadImage(`kyc/${step.key}`, result.assets[0].uri, "application/pdf");
      setDocument(step.key, url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha ao enviar o PDF. Tente de novo.");
    } finally {
      setUploading(false);
    }
  }

  function handleContinue() {
    if (!captured || (step.needsCpfField && cpfNumber.trim().length < 11)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      router.push("/(cleaner-onboarding)/termos");
    }
  }

  return (
    <WizardShell step={stepIndex + 1} maxStep={5} footerLabel="Confirmar" onFooterPress={handleContinue}>
      <Text style={styles.stepLabel}>Passo {stepIndex + 1} de 5</Text>
      <Text style={styles.title}>{step.title}</Text>
      <Text style={styles.instruction}>{step.instruction}</Text>

      {step.needsCpfField && (
        <View style={{ marginBottom: space.l }}>
          <LabeledInput label="CPF" keyboardType="numeric" value={cpfNumber} onChangeText={setCpfNumber} maxLength={11} placeholder="Somente números" />
        </View>
      )}

      <View style={[styles.previewBox, captured && styles.previewBoxCaptured]}>
        {captured ? (
          <>
            <Icon name="check-circle" size={40} color={C.success} />
            <Text style={styles.previewLabel}>Documento enviado</Text>
          </>
        ) : (
          <>
            <Icon name="camera" size={40} color={C.purplePrimary} />
            <Text style={styles.previewLabel} onPress={handleCapture}>
              {uploading ? "Enviando..." : "Toque para tirar foto"}
            </Text>
          </>
        )}
      </View>

      {step.allowPdf && !captured && (
        <Text style={styles.pdfLink} onPress={handlePickPdf}>
          {uploading ? "Enviando..." : "ou enviar um PDF"}
        </Text>
      )}

      {uploadError && (
        <View style={{ marginTop: space.l }}>
          <Alert variant="error">{uploadError}</Alert>
        </View>
      )}

      {showError && (
        <View style={{ marginTop: space.l }}>
          <Alert variant="error">
            {step.needsCpfField && cpfNumber.trim().length < 11 ? "Informe um CPF válido." : "Envie o documento para continuar."}
          </Alert>
        </View>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  stepLabel: { fontFamily: font.medium, fontSize: font.labelSm, color: C.purplePrimary, marginBottom: space.s },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.s },
  instruction: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, lineHeight: 22, marginBottom: space.xl },
  previewBox: {
    minHeight: 220,
    backgroundColor: C.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    gap: space.m,
  },
  previewBoxCaptured: { backgroundColor: C.successBg, borderColor: C.success },
  previewLabel: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  pdfLink: {
    fontFamily: font.medium,
    fontSize: font.bodySm,
    color: C.purplePrimary,
    textAlign: "center",
    marginTop: space.m,
  },
});
