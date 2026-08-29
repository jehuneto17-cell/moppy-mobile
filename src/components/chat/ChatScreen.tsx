import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, space } from "@/src/theme";

type Message = { message_id: string; sender_id: string; text: string; created_at: { seconds: number } | null };

// Chat (C22/F18) — mesma UI dos dois lados, o chatId é sempre o orderId (1 chat por pedido).
export function ChatScreen({ orderId, peerName }: { orderId: string; peerName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const q = query(collection(db, "chats", orderId, "messages"), orderBy("created_at", "asc"));
    return onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ message_id: d.id, ...d.data() } as Message))));
  }, [orderId]);

  async function handleSend() {
    if (!user || !draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    await addDoc(collection(db, "chats", orderId, "messages"), {
      sender_id: user.uid,
      text,
      read_by: { [user.uid]: true },
      created_at: serverTimestamp(),
    });
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.warningBar}>
        <Text style={styles.warningText}>Combinar pagamento fora do app não tem garantia da Moppy.</Text>
      </View>

      <View style={styles.header}>
        <Avatar name={peerName} size="small" />
        <Text style={styles.headerName}>{peerName}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.messagesContent}>
        {messages === null && (
          <View style={styles.center}>
            <Spinner />
          </View>
        )}

        {messages?.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="message-circle" size={32} color={C.textSecondary} />
            <Text style={styles.emptyText}>Converse por aqui assim que o pedido for confirmado.</Text>
          </View>
        )}

        {messages?.map((msg) => {
          const sent = msg.sender_id === user?.uid;
          return (
            <View key={msg.message_id} style={[styles.bubbleWrapper, { alignItems: sent ? "flex-end" : "flex-start" }]}>
              <View style={[styles.bubble, sent ? styles.bubbleSent : styles.bubbleReceived]}>
                <Text style={[styles.bubbleText, { color: sent ? "#fff" : C.textMaximum }]}>{msg.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor={C.textSecondary}
          value={draft}
          onChangeText={setDraft}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Icon name="chevron-right" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  warningBar: { backgroundColor: C.warningBg, paddingVertical: space.s, paddingHorizontal: space.l },
  warningText: { fontFamily: font.regular, fontSize: font.labelSm, color: C.warningDark, textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: space.m, padding: space.l, borderBottomWidth: 1, borderBottomColor: C.border },
  headerName: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  center: { alignItems: "center", paddingVertical: space.xxxl },
  emptyState: { alignItems: "center", paddingTop: space.xxxxl, gap: space.l },
  emptyText: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, textAlign: "center", maxWidth: 260, lineHeight: 21 },
  messagesContent: { padding: space.l, gap: space.s },
  bubbleWrapper: { width: "100%" },
  bubble: { maxWidth: "85%", paddingVertical: space.s, paddingHorizontal: space.m, borderRadius: 16 },
  bubbleSent: { backgroundColor: C.purplePrimary, borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: C.surface, borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: font.regular, fontSize: font.body },
  inputRow: { flexDirection: "row", alignItems: "center", gap: space.s, padding: space.l, borderTopWidth: 1, borderTopColor: C.border },
  input: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingVertical: space.s, paddingHorizontal: space.l, fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.purplePrimary, alignItems: "center", justifyContent: "center" },
});
