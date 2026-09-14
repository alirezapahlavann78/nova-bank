import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { GlassCard, GlassInput, PrimaryButton, GradientBackground } from '../../components/ui';
import { useTheme } from '../../theme';
import { useAI } from '../../hooks/useAI';
import { AIStoreMessage } from '../../types/ai';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const theme = useTheme();
  const { messages, isLoading, sendMessage, confirmAction, startNewConversation } = useAI();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    sendMessage(message);
  };

  const handleConfirm = (toolCallId: string, message?: string) => {
    Alert.alert('تایید عملیات', message || 'آیا مطمئن هستید؟', [
      { text: 'لغو', onPress: () => confirmAction(toolCallId, false), style: 'cancel' },
      { text: 'تایید', onPress: () => confirmAction(toolCallId, true), style: 'default' },
    ]);
  };

  const renderMessage = ({ item }: { item: AIStoreMessage }) => (
    <View style={{ marginBottom: 16, alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
      <GlassCard style={{ maxWidth: '85%', padding: 12 }}>
        {item.content ? (
          <Text
            style={{
              color: item.role === 'user' ? '#fff' : '#1e293b',
              writingDirection: 'rtl',
              textAlign: 'right',
            }}
          >
            {item.content}
          </Text>
        ) : null}

        {item.toolExecutions.length > 0 ? (
          <View style={{ marginTop: 8, gap: 4 }}>
            {item.toolExecutions.map((exec, i) => (
              <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: 8 }}>
                <Text style={{ fontSize: 12, writingDirection: 'ltr', textAlign: 'left' }}>
                  {exec.toolName}: {exec.success ? '✓' : '✗'}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {item.pendingConfirmations.length > 0 ? (
          <View style={{ marginTop: 8, gap: 8 }}>
            {item.pendingConfirmations.map((conf) => (
              <View key={conf.id} style={{ gap: 4 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#475569',
                    writingDirection: 'rtl',
                    textAlign: 'right',
                  }}
                >
                  {conf.message || `لطفاً ${conf.toolName} را تایید کنید`}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => handleConfirm(conf.id, conf.message)}
                    style={{
                      backgroundColor: '#22c55e',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flex: 1,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>تایید</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmAction(conf.id, false)}
                    style={{
                      backgroundColor: '#ef4444',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flex: 1,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>لغو</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </GlassCard>
    </View>
  );

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={{ flex: 1 }}>
          <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b', writingDirection: 'rtl' }}>
              دستیار هوش مصنوعی نوابانک
            </Text>
            <Pressable
              onPress={startNewConversation}
              style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 14, color: '#334155' }}>گفتگو جدید</Text>
            </Pressable>
          </GlassCard>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            inverted
            style={{ flex: 1 }}
          />

          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={theme.tint} />
            </View>
          ) : null}

          <GlassCard style={{ flexDirection: 'row', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, marginBottom: Platform.OS === 'ios' ? 0 : 0 }}>
            <GlassInput
              placeholder="پرسش خود را وارد کنید..."
              value={input}
              onChangeText={setInput}
              style={{ flex: 1, marginLeft: 8 }}
              onSubmitEditing={handleSend}
              editable={!isLoading}
            />
            <PrimaryButton
              label="ارسال"
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              style={{ marginLeft: 8, height: 52, borderRadius: 14 }}
            />
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
