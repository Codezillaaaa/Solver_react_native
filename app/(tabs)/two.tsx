import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function TabTwoScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768; // breakpoint for desktop view

  const student = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    course: 'Computer Science',
    quizzesTaken: 15,
    averageScore: 87,
    profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
  };

  // Dynamic styles based on screen size
  const dynamicStyles = {
    containerPadding: isDesktop ? 40 : 20,
    profileCardWidth: isDesktop ? '60%' : '90%',
    avatarSize: isDesktop ? 160 : 120,
    fontSizeName: isDesktop ? 32 : 24,
    fontSizeInfo: isDesktop ? 20 : 16,
    statNumberSize: isDesktop ? 28 : 22,
    statLabelSize: isDesktop ? 18 : 14,
    buttonPaddingVertical: isDesktop ? 16 : 10,
    buttonPaddingHorizontal: isDesktop ? 35 : 14,
  };

  return (
    <View style={[styles.container, { paddingHorizontal: dynamicStyles.containerPadding }]}>
      <View style={[styles.profileCard, { width: dynamicStyles.profileCardWidth as any }]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: student.profilePic }}
            style={[
              styles.avatar,
              {
                width: dynamicStyles.avatarSize,
                height: dynamicStyles.avatarSize,
                borderRadius: dynamicStyles.avatarSize / 2,
                borderWidth: 3,
                borderColor: '#2196f3',
              },
            ]}
          />
          <TouchableOpacity style={styles.editIcon} activeOpacity={0.7}>
            <Feather name="edit-2" size={dynamicStyles.avatarSize * 0.13} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.name, { fontSize: dynamicStyles.fontSizeName }]}>{student.name}</Text>
        <Text style={[styles.info, { fontSize: dynamicStyles.fontSizeInfo }]}>{student.course}</Text>
        <Text style={[styles.info, { fontSize: dynamicStyles.fontSizeInfo }]}>{student.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { fontSize: dynamicStyles.statNumberSize }]}>{student.quizzesTaken}</Text>
            <Text style={[styles.statLabel, { fontSize: dynamicStyles.statLabelSize }]}>Quizzes Taken</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { fontSize: dynamicStyles.statNumberSize }]}>{student.averageScore}%</Text>
            <Text style={[styles.statLabel, { fontSize: dynamicStyles.statLabelSize }]}>Average Score</Text>
          </View>
        </View>

        <View
          style={[
            styles.buttonsRow,
            isDesktop ? { flexDirection: 'row' } : { flexDirection: 'column', alignItems: 'stretch' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              styles.editButton,
              {
                paddingVertical: dynamicStyles.buttonPaddingVertical,
                paddingHorizontal: dynamicStyles.buttonPaddingHorizontal,
                marginBottom: isDesktop ? 0 : 12,
                marginRight: isDesktop ? 12 : 0,
              },
            ]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={20} color="#2196f3" />
            <Text style={[styles.buttonText, { color: '#2196f3' }]}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.logoutButton,
              {
                paddingVertical: dynamicStyles.buttonPaddingVertical,
                paddingHorizontal: dynamicStyles.buttonPaddingHorizontal,
              },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    // size and borderRadius dynamically set via inline styles
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196f3',
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontWeight: '700',
    marginTop: 15,
    color: '#333',
  },
  info: {
    color: '#666',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'space-between',
    width: '80%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: '700',
    color: '#2196f3',
  },
  statLabel: {
    color: '#999',
    marginTop: 5,
  },
  buttonsRow: {
    width: '100%',
    marginTop: 30,
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    justifyContent: 'center',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#2196f3',
    backgroundColor: '#eaf4ff',
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#2196f3',
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
