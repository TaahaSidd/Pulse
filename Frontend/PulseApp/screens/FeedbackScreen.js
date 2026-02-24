import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    Text,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import SegmentedFilter from '../components/SegmentedFilter'; // 🆕 Import the chonky filter

export default function FeedbackScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [feedback, setFeedback] = useState('');
    const [type, setType] = useState('Bug');

    const feedbackOptions = ['Bug', 'Suggestion', 'Support'];

    const handleSubmit = () => {
        if (feedback.trim().length < 5) {
            Alert.alert("Wait a second", "Please provide a bit more detail before submitting.");
            return;
        }

        // Logic for submission would go here
        Alert.alert("Thanks!", "Our team will look into your " + type.toLowerCase() + " report.");
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Send Feedback"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[styles.label, { color: theme.textSecondary }]}>FEEDBACK TYPE</Text>

                    <View style={styles.filterWrapper}>
                        <SegmentedFilter
                            options={feedbackOptions}
                            activeFilter={type}
                            onSelect={setType}
                            theme={theme}
                        />
                    </View>

                    <Text style={[styles.label, { color: theme.textSecondary }]}>YOUR MESSAGE</Text>
                    <TextInput
                        multiline
                        numberOfLines={6}
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: theme.card,
                                color: theme.text,
                                borderColor: theme.border
                            }
                        ]}
                        placeholder="Tell us what's on your mind..."
                        placeholderTextColor={theme.textTertiary}
                        value={feedback}
                        onChangeText={setFeedback}
                        textAlignVertical="top"
                    />

                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Submit Feedback"
                            onPress={handleSubmit}
                            disabled={feedback.trim().length === 0}
                        />
                    </View>

                    <Text style={[styles.hintText, { color: theme.textTertiary }]}>
                        We usually respond to support requests within 24 hours.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    label: {
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 12,
        marginTop: 25,
        fontFamily: FONTS.bold,
        marginLeft: 4,
    },
    filterWrapper: {
        flexDirection: 'row', // Required because SegmentedFilter has flex: 1
        height: 54,
        marginBottom: 10,
    },
    textArea: {
        borderRadius: 24, // Matches the "chonky" card style
        borderWidth: 1.5,
        padding: 20,
        height: 180,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    buttonWrapper: {
        marginTop: 30,
    },
    hintText: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 20,
        opacity: 0.6,
    }
});