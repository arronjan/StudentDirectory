import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function App() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [imageBase64, setImageBase64] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const list = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setStudents(list);
    } catch (error) {
      Alert.alert("Error", "Could not fetch student records.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Pick Image and convert to Base64 String
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access photos is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, // Low quality to keep base64 string size small for Firestore
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const formattedBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageBase64(formattedBase64);
    }
  };

  const handleSaveStudent = async () => {
    if (!name.trim() || !course.trim() || !yearLevel.trim() || !email.trim() || !age.trim()) {
      Alert.alert("Validation Error", "Please fill in all input fields.");
      return;
    }

    setLoading(true);
    try {
      const studentData = {
        name: name.trim(),
        course: course.trim(),
        yearLevel: yearLevel.trim(),
        email: email.trim(),
        age: age.trim(),
        profilePic: imageBase64 || null,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, "students", editingId), studentData);
        Alert.alert("Success", "Student record updated!");
      } else {
        await addDoc(collection(db, "students"), {
          ...studentData,
          createdAt: new Date()
        });
        Alert.alert("Success", "Student record created successfully!");
      }

      resetForm();
      fetchStudents();
    } catch (error) {
      Alert.alert("Error", "Failed to save record to Firestore database.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = (student) => {
    setEditingId(student.id);
    setName(student.name || "");
    setCourse(student.course || "");
    setYearLevel(student.yearLevel || "");
    setEmail(student.email || "");
    setAge(student.age || "");
    setImageBase64(student.profilePic || null);
  };

  const handleDeleteStudent = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "students", id));
            fetchStudents();
          } catch (error) {
            Alert.alert("Error", "Failed to delete record.");
          }
        }
      }
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCourse("");
    setYearLevel("");
    setEmail("");
    setAge("");
    setImageBase64(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cloud Student Directory</Text>

      <View style={styles.form}>
        <Text style={styles.formHeader}>
          {editingId ? "Update Student Profile" : "Create New Student"}
        </Text>

        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
          {imageBase64 ? (
            <Image source={{ uri: imageBase64 }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePickerText}>Select Profile Picture</Text>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Course / Program" value={course} onChangeText={setCourse} />
        <TextInput style={styles.input} placeholder="Year Level" value={yearLevel} onChangeText={setYearLevel} />
        <TextInput style={styles.input} placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />

        <TouchableOpacity style={[styles.button, editingId ? styles.updateBtn : styles.saveBtn]} onPress={handleSaveStudent} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{editingId ? "UPDATE STUDENT" : "SAVE STUDENT"}</Text>}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
            <Text style={styles.cancelBtnText}>CANCEL EDIT</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Directory Records</Text>
      {students.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image
            source={{ uri: item.profilePic || "https://via.placeholder.com/60" }}
            style={styles.avatar}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.cardName}>{item.name} ({item.age} yrs)</Text>
            <Text style={styles.cardDetails}>{item.course} - {item.yearLevel}</Text>
            <Text style={styles.cardEmail}>{item.email}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEditPress(item)}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteStudent(item.id)}>
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: "#f4f6f8" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#1a237e" },
  form: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 20, elevation: 2 },
  formHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
  imagePickerBtn: { backgroundColor: "#e0e0e0", height: 100, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 12, overflow: "hidden" },
  imagePickerText: { color: "#555", fontWeight: "600" },
  previewImage: { width: "100%", height: "100%" },
  button: { padding: 12, borderRadius: 5, alignItems: "center", marginBottom: 6 },
  saveBtn: { backgroundColor: "#1a237e" },
  updateBtn: { backgroundColor: "#2e7d32" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { padding: 8, alignItems: "center" },
  cancelBtnText: { color: "#d32f2f", fontWeight: "bold" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0e0e0" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10, backgroundColor: "#ccc" },
  infoContainer: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "bold" },
  cardDetails: { fontSize: 13, color: "#555" },
  cardEmail: { fontSize: 12, color: "#888" },
  actions: { flexDirection: "column", gap: 5 },
  editBtn: { backgroundColor: "#0288d1", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: "center" },
  deleteBtn: { backgroundColor: "#d32f2f", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "bold", fontSize: 11 }
});