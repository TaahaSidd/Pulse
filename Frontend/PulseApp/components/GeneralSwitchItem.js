import React from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import GeneralActionItem from './GeneralActionItem';

const GeneralSwitchItem = ({
    label,
    value,
    onValueChange,
    theme,
    isLast = false
}) => {
    return (
        <GeneralActionItem
            label={label}
            theme={theme}
            isLast={isLast}
            showArrow={false}
            onPress={null}
            rightComponent={
                <View style={styles.switchWrapper}>
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: '#334155', true: COLORS.primary }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#334155"
                    />
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    switchWrapper: {
        transform: [{ scale: 0.85 }], // Matches your "Pulse" aesthetic
        marginRight: -4, // Offsets switch whitespace
    },
});

export default GeneralSwitchItem;