import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useAI } from '../../hooks/useAI';
import { AIStoreMessage } from '../../types/ai';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
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
    Alert.alert(
      'تایید عملیات',
      message || `آیا مطمئن هستید؟`,
      [
        { text: 'لغو', onPress: () => confirmAction(toolCallId, false), style: 'cancel' },
        { text: 'تایید', onPress: () => confirmAction(toolCallId, true), style: 'default' },
      ],
    );
  };

  const renderMessage = ({ item }: { item: AIStoreMessage }) => (
    <View className={`mb-4 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-lg p-3 ${
          item.role === 'user' ? 'bg-blue-600' : item.role === 'tool' ? 'bg-gray-200' : 'bg-gray-100'
        }`}
      >
        {item.content ? (
          <Text
            className={`${item.role === 'user' ? 'text-white' : 'text-gray-800'}`}
            style={{ writingDirection: 'rtl', textAlign: 'right' }}
          >
            {item.content}
          </Text>
        ) : null}

        {item.toolExecutions.length > 0 && (
          <View className="mt-2 space-y-1">
            {item.toolExecutions.map((exec, i) => (
              <View key={i} className="bg-gray-300 rounded p-2">
                <Text className="text-xs" style={{ writingDirection: 'ltr', textAlign: 'left' }}>
                  {exec.toolName}: {exec.success ? '✓' : '✗'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {item.pendingConfirmations.length > 0 && (
          <View className="mt-2 space-y-2">
            {item.pendingConfirmations.map((conf) => (
              <View key={conf.id} className="space-y-1">
                <Text className="text-xs text-gray-600" style={{ writingDirection: 'rtl', textAlign: 'right' }}>
                  {conf.message || `لطفاً ${conf.toolName} را تایید کنید`}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleConfirm(conf.id, conf.message)}
                    className="bg-green-600 rounded px-3 py-1 flex-1"
                  >
                    <Text className="text-white text-center text-xs">تایید</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmAction(conf.id, false)}
                    className="bg-red-600 rounded px-3 py-1 flex-1"
                  >
                    <Text className="text-white text-center text-xs">لغو</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900" style={{ writingDirection: 'rtl' }}>
          دستیار هوش مصنوعی نوابانک
        </Text>
        <Pressable onPress={startNewConversation} className="bg-gray-200 rounded px-3 py-1">
          <Text className="text-sm text-gray-700">گفتگو جدید</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        inverted
      />

      {isLoading && (
        <View className="items-center py-2">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}

      <View className="flex-row p-4 bg-white border-t border-gray-200">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="پرسش خود را وارد کنید..."
          className="flex-1 bg-gray-100 rounded-lg px-3 py-2 ml-2"
          style={{ writingDirection: 'rtl', textAlign: 'right' }}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 rounded-lg px-4 py-2"
        >
          <Text className="text-white font-semibold">ارسال</Text>
        </Pressable>
      </View>
    </View>
  );
}
