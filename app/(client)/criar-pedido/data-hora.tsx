import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { WizardShell } from "@/src/components/wizard/WizardShell";
import { useCreateOrderStore } from "@/src/store/createOrderStore";
import { C, font, radius, space } from "@/src/theme";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

function buildDays() {
  const today = new Date();
  return Array.from({ length: 10 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const disabled = i === 0 || d.getDay() === 0;
    return { dateStr: d.toISOString().slice(0, 10), weekday: WEEKDAYS[d.getDay()], dayNum: d.getDate(), disabled };
  });
}

export default function DataHoraScreen() {
  const router = useRouter();
  const { setSchedule } = useCreateOrderStore();
  const [days] = useState(buildDays);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  function handleContinue() {
    if (!selectedDate || !selectedTime) {
      setShowError(true);
      return;
    }
    setSchedule(selectedDate, selectedTime);
    router.push("/(client)/criar-pedido/revisao");
  }

  return (
    <WizardShell step={5} footerLabel="Continuar" onFooterPress={handleContinue}>
      <Text style={styles.title}>Quando você precisa?</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s }}>
        {days.map((d) => {
          const isSelected = selectedDate === d.dateStr;
          return (
            <Pressable
              key={d.dateStr}
              disabled={d.disabled}
              onPress={() => setSelectedDate(d.dateStr)}
              style={[styles.dayChip, isSelected && styles.dayChipSelected, d.disabled && { opacity: 0.6 }]}
            >
              <Text style={[styles.dayWeekday, isSelected && styles.dayTextSelected]}>{d.weekday}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayTextSelected]}>{d.dayNum}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.timeLabel}>Horário</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.s }}>
        {TIMES.map((t) => {
          const isSelected = selectedTime === t;
          return (
            <Pressable key={t} onPress={() => setSelectedTime(t)} style={[styles.timeChip, isSelected && styles.timeChipSelected]}>
              <Text style={[styles.timeText, isSelected && styles.dayTextSelected]}>{t}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showError && (
        <View style={{ marginTop: space.xl }}>
          <Alert variant="error">Escolha um horário disponível.</Alert>
        </View>
      )}
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xxl },
  dayChip: {
    width: 52,
    height: 64,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipSelected: { backgroundColor: C.purplePrimary, borderColor: C.purplePrimary },
  dayWeekday: { fontFamily: font.regular, fontSize: 11, color: C.textMaximum },
  dayNum: { fontFamily: font.bold, fontSize: font.bodyLg, color: C.textMaximum, marginTop: 4 },
  dayTextSelected: { color: "#fff" },
  timeLabel: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum, marginTop: space.xxxl, marginBottom: space.m },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  timeChipSelected: { backgroundColor: C.purplePrimary, borderColor: C.purplePrimary },
  timeText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
});
